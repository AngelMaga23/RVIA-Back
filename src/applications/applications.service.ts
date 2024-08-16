import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, Logger, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as archiver from 'archiver';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, unlinkSync } from 'fs';
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
import { CheckmarxService } from 'src/checkmarx/checkmarx.service';

@Injectable()
export class ApplicationsService {

  private readonly logger = new Logger('ApplicationsService');
  private downloadPath = '/sysx/bito/projects';

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly estatusService: ApplicationstatusService,
    private readonly sourcecodeService: SourcecodeService,
    private readonly httpService: HttpService,
    private readonly encryptionService: CommonService,
    @InjectRepository(Scan)
    private scanRepository: Repository<Scan>,
    @Inject(forwardRef(() => CheckmarxService)) // Usamos forwardRef aquí
    private readonly checkmarxService: CheckmarxService,
  ) {
  }

  async findAll(user: User) {

    try {
      
      const aplicaciones = user.position?.nom_rol === ValidRoles.admin
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

  async findOne(id: number) {
    const aplicacion = await this.applicationRepository.findOneBy({ idu_aplicacion:id });

    if( !aplicacion )
      throw new NotFoundException(`Aplicación con ${id} no encontrado `);

    return aplicacion; 
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
      await fsExtra.remove(tempFolderPath);
      await fsExtra.remove(file.path);
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

      if (file) {
        const scan = new Scan();
        scan.nom_escaneo = this.encryptionService.encrypt(file.filename);
        scan.nom_directorio = this.encryptionService.encrypt(file.destination);
        scan.application = application;
        await this.scanRepository.save(scan);
        
        await this.checkmarxService.callPython( application.nom_aplicacion, file.filename, application );
      }

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
    const nameApplication = zipFile.originalname.split('.')[0].replace(/\s+/g, '-');
    const uniqueTempFolderName = `temp-${uuid()}`;
    const tempFolderPath = join(zipFile.destination, uniqueTempFolderName);
    const tempZipPath = join(tempFolderPath, zipFile.filename);
    const repoFolderPath = join(zipFile.destination, nameApplication);
  
    try {
      const estatu = await this.estatusService.findOne(2);
      if (!estatu) throw new NotFoundException('Estatus no encontrado');
  
      await fsExtra.ensureDir(tempFolderPath);
      await fsExtra.move(zipFile.path, tempZipPath);
  
      try {
        if (zipFile.mimetype === 'application/zip') {
          // Descomprimir archivo .zip
          await unzipper.Open.file(tempZipPath)
            .then(async (directory) => {
              await fsExtra.remove(repoFolderPath);
              await fsExtra.ensureDir(repoFolderPath);
  
              await directory.extract({ path: repoFolderPath });
            })
            .then(async () => {
              await fsExtra.remove(tempZipPath);
            });
        } else if (zipFile.mimetype === 'application/x-7z-compressed') {
          // Descomprimir archivo .7z
          await new Promise<void>((resolve, reject) => {
            seven.unpack(tempZipPath, repoFolderPath, (err) => {
              if (err) {
                return reject(new InternalServerErrorException(`Error al descomprimir el archivo .7z: ${err.message}`));
              }
              resolve(); // Aquí pasa el tipo adecuado de `resolve`.
            });
          });
        } else {
          throw new UnsupportedMediaTypeException('Formato de archivo no soportado');
        }
      } catch (error) {
        throw new InternalServerErrorException(`Error al descomprimir el archivo: ${error.message}`);
      }
  
      await fsExtra.remove(tempZipPath);
      await fsExtra.remove(tempFolderPath);
  
      // Crear el registro de código fuente
      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(zipFile.filename),
        nom_directorio: this.encryptionService.encrypt(repoFolderPath),
      });
  
      // Crear el registro de la aplicación
      const application = new Application();
      application.nom_aplicacion = this.encryptionService.encrypt(nameApplication);
      application.num_accion = createFileDto.num_accion;
      application.opc_lenguaje = createFileDto.opc_lenguaje;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;
  
      await this.applicationRepository.save(application);
  
      // Procesar el archivo PDF (si existe)
      if (pdfFile) {

        const scan = new Scan();
        scan.nom_escaneo = this.encryptionService.encrypt(pdfFile.filename);
        scan.nom_directorio = this.encryptionService.encrypt(pdfFile.destination);
        scan.application = application;
        await this.scanRepository.save(scan);
  
        await this.checkmarxService.callPython(application.nom_aplicacion, pdfFile.filename, application);
      }
  
      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
      return application;
  
    } catch (error) {
      console.error('Error al procesar el archivo:', error);
      if (pdfFile) {
        await fsExtra.remove(pdfFile.path);
      }
  
      if (zipFile && zipFile.path) {
        await fsExtra.remove(tempZipPath);
        await fsExtra.remove(tempFolderPath);
      }
      this.handleDBExceptions(error);
      throw error; // Re-lanzar el error para que se propague
    }
  }
  
  
  

  async update(id: number, estatusId: number) {
    try {
      const application = await this.applicationRepository.findOne({
        where: { idu_aplicacion: id },
        relations: ['applicationstatus', 'user'],
      });
      if (!application) throw new NotFoundException(`Aplicación con ID ${id} no encontrado`);

      const estatu = await this.estatusService.findOne(estatusId);
      if (!estatu) throw new NotFoundException(`Estatus con ID ${estatusId} no encontrado`);

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
    if (!application) throw new NotFoundException(`Aplicación con ID ${id} no encontrado`);

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

  // async test() {

  //   // const directoryPath = join(this.downloadPath);
  //   const fileName1 = "Project-Sample";
  //   // const fileName2 = "0d56048c-908b-43a3-912d-a8a4a1109d4a.dsfdsfds.pdf";
  //   const fileName2 = "0d56048c-908b-43a3-912d-a8a4a1109d4a.dsfdsfds.pdf";


  //   return await this.callPython(fileName1, fileName2);

  // }
}
