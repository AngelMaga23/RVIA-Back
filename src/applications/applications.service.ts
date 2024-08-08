import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as archiver from 'archiver';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, createWriteStream, existsSync, unlinkSync } from 'fs';
import { catchError, lastValueFrom } from 'rxjs';
import { join } from 'path';
import * as unzipper from 'unzipper';
import * as seven from '7zip-min';
import { v4 as uuid } from 'uuid';
import { promisify } from 'util';
import { pipeline } from 'stream';
import * as fsExtra from 'fs-extra';

import { CreateApplicationDto, CreateFileDto } from './dto';
import { Application } from './entities/application.entity';
import { ApplicationstatusService } from '../applicationstatus/applicationstatus.service';
import { SourcecodeService } from '../sourcecode/sourcecode.service';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { CommonService } from 'src/common/common.service';
import { Scan } from 'src/scans/entities/scan.entity';  


@Injectable()
export class ApplicationsService {

  private readonly logger = new Logger('ApplicationsService');
  private downloadPath = '/tmp/bito';

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly estatusService: ApplicationstatusService,
    private readonly sourcecodeService: SourcecodeService,
    private readonly httpService: HttpService,
    private readonly encryptionService: CommonService,
    @InjectRepository(Scan)
    private scanRepository: Repository<Scan>,
  ) {
  }

  async findAll(user: User) {

    try {
      
      const aplicaciones = user.position?.nom_puesto === ValidRoles.admin
      ? await this.applicationRepository.find()
      : await this.applicationRepository.find({ where: { user: { idu_usuario: user.idu_usuario } } });

      aplicaciones.forEach(aplicacion => {
        aplicacion.nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
        aplicacion.applicationstatus.des_estatus_aplicacion = this.encryptionService.decrypt(aplicacion.applicationstatus.des_estatus_aplicacion);
        aplicacion.sourcecode.nom_codigo_fuente = this.encryptionService.decrypt(aplicacion.sourcecode.nom_codigo_fuente);
        aplicacion.sourcecode.nom_directorio = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
        aplicacion.user.nom_usuario = this.encryptionService.decrypt(aplicacion.user.nom_usuario);
      });

      return aplicaciones;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async createGitFile(createApplicationDto: CreateApplicationDto, user: User, file?) {
    try {
      const repoInfo = this.parseGitHubURL(createApplicationDto.url);
      if (!repoInfo) {
        throw new BadRequestException('Invalid GitHub repository URL');
      }

      return await this.processRepository(repoInfo.repoName, repoInfo.userName, user, file, createApplicationDto.num_accion, createApplicationDto.opc_lenguaje, 'GitHub');
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createGitLabFile(createApplicationDto: CreateApplicationDto, user: User, file?) {
    try {
      const repoInfo = this.getRepoInfo(createApplicationDto.url);
      if (!repoInfo) {
        throw new BadRequestException('Invalid GitLab repository URL');
      }

      return await this.processRepository(repoInfo.repoName, `${repoInfo.userName}/${repoInfo.groupName}`, user, file, createApplicationDto.num_accion, createApplicationDto.opc_lenguaje, 'GitLab');
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private async processRepository(repoName: string, repoUserName: string, user: User, file, numAccion: number, opcLenguaje: number, platform: string) {
    
    const streamPipeline = promisify(pipeline);
    const uniqueTempFolderName = `temp-${uuid()}`;
    const tempFolderPath = join(this.downloadPath, uniqueTempFolderName);
    const repoFolderPath = join(this.downloadPath, repoName);

    await fsExtra.ensureDir(tempFolderPath);

    const branches = ['main', 'master'];
    let zipUrl: string | null = null;

    for (const branch of branches) {
      const potentialUrl = platform === 'GitHub' 
        ? `https://github.com/${repoUserName}/${repoName}/archive/refs/heads/${branch}.zip`
        : `https://gitlab.com/${repoUserName}/${repoName}/-/archive/${branch}/${repoName}-${branch}.zip`;

      try {
        await lastValueFrom(this.httpService.head(potentialUrl));
        zipUrl = potentialUrl;
        break;
      } catch (error) {
        continue;
      }
    }

    if (!zipUrl) {
      throw new InternalServerErrorException('No se encontró ninguna rama válida (main o master)');
    }

    const response = await lastValueFrom(
      this.httpService.get(zipUrl, { responseType: 'stream' }).pipe(
        catchError(() => {
          fsExtra.remove(tempFolderPath);
          throw new InternalServerErrorException('Error al descargar el repositorio');
        }),
      ),
    );

    const tempZipPath = join(tempFolderPath, `${repoName}.zip`);

    try {
      
      await streamPipeline(response.data, createWriteStream(tempZipPath));

      await unzipper.Open.file(tempZipPath)
        .then(d => d.extract({ path: tempFolderPath }))
        .then(async () => {
          // Obtener el nombre del directorio extraído
          const extractedFolders = await fsExtra.readdir(tempFolderPath);
          const extractedFolder = join(tempFolderPath, extractedFolders.find(folder => folder.includes(repoName)));

          await fsExtra.ensureDir(repoFolderPath);
          await fsExtra.copy(extractedFolder, repoFolderPath);
          await fsExtra.remove(tempZipPath);
          await fsExtra.remove(tempFolderPath);
        });

      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(repoName),
        nom_directorio: this.encryptionService.encrypt(repoFolderPath),
      });

      const estatu = await this.estatusService.findOne(2);
      const application = new Application();
      application.nom_aplicacion = this.encryptionService.encrypt(repoName);
      application.num_accion = numAccion;
      application.opc_lenguaje = opcLenguaje;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      await this.applicationRepository.save(application);
      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
      return application;
    } catch (error) {
      throw new InternalServerErrorException('Error al procesar el repositorio');
    } finally {
      await fsExtra.remove(tempFolderPath);
      await fsExtra.remove(tempZipPath);
    }
  }

  private parseGitHubURL(url: string): { repoName: string, userName: string } | null {
    const regex = /github\.com\/([^\/]+)\/([^\/]+)\.git$/;
    const match = url.match(regex);
    if (match) {
      return { userName: match[1], repoName: match[2] };
    }
    return null;
  }

  private getRepoInfo(url: string): { userName: string, groupName: string, repoName: string } | null {
    try {
      const { pathname } = new URL(url);
      
      const pathSegments = pathname.split('/').filter(segment => segment);

      if (pathSegments.length > 0 && pathSegments[pathSegments.length - 1].endsWith('.git')) {
        const repoName = pathSegments.pop()!.replace('.git', '');
        const groupName = pathSegments.pop()!;
        const userName = pathSegments.join('/');
    
        return {
          userName,
          groupName,
          repoName
        };
      }
    } catch (error) {
      console.error('Error parsing URL:', error);
    }
  
    return null;
  }

  async createFiles(createFileDto: CreateFileDto, zipFile: Express.Multer.File, pdfFile: Express.Multer.File | undefined, user: User) {
    try {
      const nameApplication = zipFile.originalname.split('.')[0];
      const estatu = await this.estatusService.findOne(2);
      if (!estatu) throw new NotFoundException('Estatus not found');

      const unzipPromise = zipFile.mimetype.includes('x-7z-compressed')
        ? new Promise<void>((resolve, reject) => {
          seven.unpack(zipFile.path, zipFile.destination, err => (err ? reject(err) : resolve()));
        })
        : createReadStream(zipFile.path).pipe(unzipper.Extract({ path: zipFile.destination })).promise();

      await unzipPromise;

      const pathDelete = join(zipFile.destination, zipFile.filename);
      unlinkSync(pathDelete);

      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(zipFile.filename),
        nom_directorio: this.encryptionService.encrypt(zipFile.destination),
      });

      const application = new Application();
      application.nom_aplicacion = this.encryptionService.encrypt(nameApplication);
      application.num_accion = createFileDto.num_accion;
      application.opc_lenguaje = createFileDto.opc_lenguaje;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      await this.applicationRepository.save(application);

      if (pdfFile) {
        const scan = new Scan();
        scan.nom_escaneo = this.encryptionService.encrypt(pdfFile.filename);
        scan.nom_directorio = this.encryptionService.encrypt(pdfFile.destination);
        scan.application = application;
        await this.scanRepository.save(scan);
      }

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
      return application;
    } catch (error) {
      if (zipFile && zipFile.destination) {
        await fsExtra.remove(zipFile.destination);
      }
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, estatusId: number) {
    try {
      const application = await this.applicationRepository.findOne({
        where: { idu_aplicacion: id },
        relations: ['applicationstatus', 'user'],
      });
      if (!application) throw new NotFoundException(`Application with ID ${id} not found`);

      const estatu = await this.estatusService.findOne(estatusId);
      if (!estatu) throw new NotFoundException(`Estatus with ID ${estatusId} not found`);

      application.applicationstatus = estatu;
      await this.applicationRepository.save(application);

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
      return application;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async getStaticFileZip(id: number, response): Promise<void> {
    const application = await this.applicationRepository.findOne({
      where: { idu_aplicacion: id },
      relations: ['applicationstatus', 'user', 'scans'],
    });
    if (!application) throw new NotFoundException(`Application with ID ${id} not found`);

    const decryptedAppName = this.encryptionService.decrypt(application.nom_aplicacion);
    const directoryPath = join(this.downloadPath, decryptedAppName);
    if (!existsSync(directoryPath)) throw new BadRequestException(`No directory found with name ${decryptedAppName}`);

    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Disposition', `attachment; filename="${decryptedAppName}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => { throw new BadRequestException(`Error while archiving: ${err.message}`); });

    archive.pipe(response);
    archive.directory(directoryPath, false);

    if (application.scans && application.scans.length > 0) {
      for (const scan of application.scans) {
        const decryptedScanName = this.encryptionService.decrypt(scan.nom_escaneo);
        const scanPath = join(this.downloadPath, decryptedScanName);
        if (existsSync(scanPath)) {
          archive.file(scanPath, { name: `escaneo/${decryptedScanName}` });
        }
      }
    }

    await archive.finalize();
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.response) throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
