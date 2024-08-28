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
import { promises as fs } from 'fs';

import { CreateApplicationDto, CreateFileDto } from './dto';
import { Application } from './entities/application.entity';
import { ApplicationstatusService } from '../applicationstatus/applicationstatus.service';
import { SourcecodeService } from '../sourcecode/sourcecode.service';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { CommonService } from 'src/common/common.service';
import { Scan } from 'src/scans/entities/scan.entity';
import { CheckmarxService } from 'src/checkmarx/checkmarx.service';

const addon = require('../../../../../sysx/progs/rvia/build/Release/rvia');

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
        ? await this.applicationRepository.find({
          relations: ['checkmarx']
        })
        : await this.applicationRepository.find({ where: { user: { idu_usuario: user.idu_usuario } },relations: ['checkmarx'] });

      aplicaciones.forEach(aplicacion => {
        aplicacion.nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
        aplicacion.applicationstatus.des_estatus_aplicacion = this.encryptionService.decrypt(aplicacion.applicationstatus.des_estatus_aplicacion);
        aplicacion.sourcecode.nom_codigo_fuente = this.encryptionService.decrypt(aplicacion.sourcecode.nom_codigo_fuente);
        aplicacion.sourcecode.nom_directorio = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
        aplicacion.user.nom_usuario = this.encryptionService.decrypt(aplicacion.user.nom_usuario);
     
        if (aplicacion.checkmarx && aplicacion.checkmarx.length > 0){
          aplicacion.checkmarx.forEach(checkmarx => {
            checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
          });
        }

      });

      return aplicaciones;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async findOne(id: number) {
    const aplicacion = await this.applicationRepository.findOneBy({ idu_aplicacion: id });

    if (!aplicacion)
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

    const obj = new addon.CRvia();
    const streamPipeline = promisify(pipeline);
    const uniqueTempFolderName = `temp-${uuid()}`;
    const tempFolderPath = join(this.downloadPath, uniqueTempFolderName);
    const repoFolderPath = join(this.downloadPath, repoName);
    const iduProject = obj.createIDProject();

    const isSanitizacion = numAccion == 2 ? true : false;
    let dataCheckmarx: { message: string; error?: string; isValid?: boolean; checkmarx?: any };

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
    const zipGit = join(this.downloadPath, `${iduProject}_${repoName}.zip`);
   

    try {

      await streamPipeline(response.data, createWriteStream(tempZipPath));

      await fsExtra.copy(tempZipPath, zipGit);

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
      application.idu_proyecto = iduProject;
      application.num_accion = numAccion;
      application.opc_lenguaje = opcLenguaje;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      await this.applicationRepository.save(application);

      if (file) {

        const pdfFileRename = await this.moveAndRenamePdfFile(file, repoFolderPath, repoName, iduProject);

        if (isSanitizacion) {
          dataCheckmarx = await this.checkmarxService.callPython(application.nom_aplicacion, pdfFileRename, application);
          if (dataCheckmarx.isValid) {
            const scan = new Scan();
            scan.nom_escaneo = this.encryptionService.encrypt(pdfFileRename);
            scan.nom_directorio = this.encryptionService.encrypt(join(repoFolderPath, pdfFileRename));
            scan.application = application;
            await this.scanRepository.save(scan);
          } else {
            await fsExtra.remove(join(repoFolderPath, pdfFileRename));
          }
        }

        if (numAccion != 2) {
          const scan = new Scan();
          scan.nom_escaneo = this.encryptionService.encrypt(pdfFileRename);
          scan.nom_directorio = this.encryptionService.encrypt(join(repoFolderPath, pdfFileRename));
          scan.application = application;
          await this.scanRepository.save(scan);
        }

      }

      
      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return {
        application,
        checkmarx: isSanitizacion && file ? dataCheckmarx.checkmarx : [],
        esSanitizacion: isSanitizacion,
      };

    } catch (error) {
      await fsExtra.remove(repoFolderPath);
      await fsExtra.remove(zipGit);
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

    const obj = new addon.CRvia();
    const nameApplication = zipFile.originalname.split('.')[0].replace(/\s+/g, '-');
    const uniqueTempFolderName = `temp-${uuid()}`;
    const tempFolderPath = join(zipFile.destination, uniqueTempFolderName);
    const tempZipPath = join(tempFolderPath, zipFile.filename);
    const repoFolderPath = join(zipFile.destination, nameApplication);
    const isSanitizacion = createFileDto.num_accion == 2 ? true : false;
    let dataCheckmarx: { message: string; error?: string; isValid?: boolean; checkmarx?: any };
    const iduProject = obj.createIDProject();

    try {
      const estatu = await this.estatusService.findOne(2);
      if (!estatu) throw new NotFoundException('Estatus no encontrado');

      await fsExtra.ensureDir(tempFolderPath);
      await fsExtra.move(zipFile.path, tempZipPath);

      // Verifica si el archivo se movió correctamente
      const fileExists = await fsExtra.pathExists(tempZipPath);
      if (!fileExists) {
        throw new InternalServerErrorException(`El archivo no se movió correctamente a ${tempZipPath}`);
      }

      try {
        if (zipFile.mimetype === 'application/zip' || zipFile.mimetype === 'application/x-zip-compressed') {
          // Descomprimir archivo .zip
          await unzipper.Open.file(tempZipPath)
            .then(async (directory) => {
              await fsExtra.remove(repoFolderPath);
              await fsExtra.ensureDir(repoFolderPath);
              await directory.extract({ path: repoFolderPath });
            })
            .catch(error => {
              throw new InternalServerErrorException(`Error al descomprimir el archivo .zip: ${error.message}`);
            });
        } else if (zipFile.mimetype === 'application/x-7z-compressed') {
          // Descomprimir archivo .7z
          await new Promise<void>((resolve, reject) => {
            seven.unpack(tempZipPath, repoFolderPath, (err) => {
              if (err) {
                return reject(new InternalServerErrorException(`Error al descomprimir el archivo .7z: ${err.message}`));
              }
              resolve();
            });
          });
        } else {
          throw new UnsupportedMediaTypeException('Formato de archivo no soportado');
        }
      } catch (error) {
        throw new InternalServerErrorException(`Error al descomprimir el archivo: ${error.message}`);
      }

      // Crear el registro de código fuente
      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(zipFile.filename),
        nom_directorio: this.encryptionService.encrypt(repoFolderPath),
      });

      // Crear el registro de la aplicación
      const application = new Application();
      application.nom_aplicacion = this.encryptionService.encrypt(nameApplication);
      application.idu_proyecto = iduProject;
      application.num_accion = createFileDto.num_accion;
      application.opc_lenguaje = createFileDto.opc_lenguaje;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      await this.applicationRepository.save(application);

      // Renombrar el archivo .zip o .7z con el id y nombre de la aplicación
      const newZipFileName = `${application.idu_proyecto}_${nameApplication}.${zipFile.originalname.split('.')[1]}`;
      const newZipFilePath = join(zipFile.destination, newZipFileName);

      // Verifica si el archivo existe antes de renombrarlo
      const tempZipExists = await fsExtra.pathExists(tempZipPath);
      if (tempZipExists) {
        await fsExtra.rename(tempZipPath, newZipFilePath);
      } else {
        throw new InternalServerErrorException(`El archivo a renombrar no existe: ${tempZipPath}`);
      }

      await fsExtra.remove(tempFolderPath);

      // Procesar el archivo PDF (si existe)
      if (pdfFile) {
        const pdfFileRename = await this.moveAndRenamePdfFile(pdfFile, repoFolderPath, nameApplication, iduProject);

        if (isSanitizacion) {
          dataCheckmarx = await this.checkmarxService.callPython(application.nom_aplicacion, pdfFileRename, application);

          if (dataCheckmarx.isValid) {
            const scan = new Scan();
            scan.nom_escaneo = this.encryptionService.encrypt(pdfFileRename);
            scan.nom_directorio = this.encryptionService.encrypt(join(repoFolderPath, pdfFileRename));
            scan.application = application;
            await this.scanRepository.save(scan);
          } else {
            await fsExtra.remove(join(repoFolderPath, pdfFileRename));
          }
        }

        if (createFileDto.num_accion != 2) {
          const scan = new Scan();
          scan.nom_escaneo = this.encryptionService.encrypt(pdfFileRename);
          scan.nom_directorio = this.encryptionService.encrypt(join(repoFolderPath, pdfFileRename));
          scan.application = application;
          await this.scanRepository.save(scan);
        }
      }

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return {
        application,
        checkmarx: isSanitizacion && pdfFile ? dataCheckmarx.checkmarx : [],
        esSanitizacion: isSanitizacion,
      };

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

  private async moveAndRenamePdfFile(pdfFile: Express.Multer.File, repoFolderPath: string, project: string, idu_project: string): Promise<string> {
    const newPdfFileName = `checkmarx_${idu_project}_${project}.pdf`;
    const newPdfFilePath = join(repoFolderPath, newPdfFileName);

    try {

      if (await fs.access(newPdfFilePath).then(() => true).catch(() => false)) {
        await fs.unlink(newPdfFilePath);
      }

      await fsExtra.move(pdfFile.path, newPdfFilePath); // Mueve y renombra el archivo
      return newPdfFileName; // Devuelve el nuevo nombre del archivo

    } catch (error) {

      throw new InternalServerErrorException(`Error al mover y renombrar el archivo PDF: ${error.message}`);
    }
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    if (error.response) throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

}
