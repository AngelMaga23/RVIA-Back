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
import { v4 as uuid } from 'uuid'
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
  // private readonly basePath = join(__dirname, '..', '..', '');
  private readonly basePath = '';

  

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly estatusService: ApplicationstatusService,
    private readonly sourcecodeService: SourcecodeService,
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly encryptionService: CommonService,
    @InjectRepository(Scan)
    private scanRepository: Repository<Scan>,
  ) {
    // this.ensureDirectoryExists(this.downloadPath);
  }

  async findAll(user: User) {

    if (user.position !== null && user.position.nom_puesto == ValidRoles.admin) {

      const aplicaciones = await this.applicationRepository.find();

      aplicaciones.map(aplicacion => {
        aplicacion.nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
        aplicacion.applicationstatus.des_estatus_aplicacion = this.encryptionService.decrypt(aplicacion.applicationstatus.des_estatus_aplicacion);
        aplicacion.sourcecode.nom_codigo_fuente = this.encryptionService.decrypt(aplicacion.sourcecode.nom_codigo_fuente);
        aplicacion.sourcecode.nom_directorio = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
        aplicacion.user.nom_usuario = this.encryptionService.decrypt(aplicacion.user.nom_usuario);
        return aplicaciones;
      });

      return aplicaciones;
    }

    const aplicaciones = await this.applicationRepository.find({
      where: { user: { idu_usuario: user.idu_usuario } },
    });

    aplicaciones.map(aplicacion => {
      aplicacion.nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
      aplicacion.applicationstatus.des_estatus_aplicacion = this.encryptionService.decrypt(aplicacion.applicationstatus.des_estatus_aplicacion);
      aplicacion.sourcecode.nom_codigo_fuente = this.encryptionService.decrypt(aplicacion.sourcecode.nom_codigo_fuente);
      aplicacion.sourcecode.nom_directorio = this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio);
      aplicacion.user.nom_usuario = this.encryptionService.decrypt(aplicacion.user.nom_usuario);
      return aplicaciones;
    });

    return aplicaciones;
  }

  async createGitFile(createApplicationDto: CreateApplicationDto, user: User, file?) {

    try {
      const streamPipeline = promisify(pipeline);
      const repoName = this.getRepoName(createApplicationDto.url);
      const repoUserName = this.getUserName(createApplicationDto.url);

      const uniqueTempFolderName = `temp-${uuid()}`;
      const tempFolderPath = join(this.downloadPath, uniqueTempFolderName);
      const repoFolderPath = join(this.downloadPath, repoName);

      await fsExtra.ensureDir(tempFolderPath);
      // mkdirSync(repoFolderPath, { recursive: true });

      const zipUrl = `https://github.com/${repoUserName}/${repoName}/archive/refs/heads/main.zip`;

      const response = await lastValueFrom(
        this.httpService.get(zipUrl, { responseType: 'stream' }).pipe(
          catchError((err) => {
            fsExtra.remove(tempFolderPath);
            throw new InternalServerErrorException('Error al descargar el repositorio');
          }),
        ),
      );
    
      const tempZipPath = join(tempFolderPath, `${repoName}.zip`);
      await streamPipeline(response.data, createWriteStream(tempZipPath));
      // await response.data.pipe(unzipper.Extract({ path: repoFolderPath })).promise();

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

      const estatu = await this.estatusService.findOne(2);

      if (!estatu) throw new NotFoundException(`Estatus not found `);

      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(repoName),
        nom_directorio: this.encryptionService.encrypt(this.downloadPath)
      });

      const application = new Application();
      application.nom_aplicacion = this.encryptionService.encrypt(repoName);
      application.num_accion = createApplicationDto.num_accion;
      application.opc_lenguaje = createApplicationDto.opc_lenguaje;
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

      }

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return application;

    } catch (error) {
      this.handleDBExceptions(error);
    }


  }

  private getRepoName(url: string): string {
    const regex = /([^\/]+)\.git$/;
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
    return '';
  }

  private getUserName(url: string): string {
    const regex = /github\.com\/([^\/]+)\/[^\/]+\.git$/;
    const match = url.match(regex);
    if (match) {
      return match[1];
    }
    return '';
  }

  async createFiles(createFileDto: CreateFileDto, zipFile: Express.Multer.File, pdfFile: Express.Multer.File | undefined, user: User) {

    try {

      const nameApplication = zipFile.originalname.split('.')[0];
      const estatu = await this.estatusService.findOne(2);

      if (!estatu) throw new NotFoundException(`Estatus not found `);

      const unzipPromise = zipFile.mimetype.includes('x-7z-compressed')
        ? new Promise<void>((resolve, reject) => {
          seven.unpack(zipFile.path, zipFile.destination, err => {
            if (err) return reject(err);
            resolve();
          });
        })
        : createReadStream(zipFile.path)
          .pipe(unzipper.Extract({ path: zipFile.destination }))
          .promise();


      await unzipPromise;

      const pathDelete = join(zipFile.destination, zipFile.filename);
      unlinkSync(pathDelete);

      const sourcecode = await this.sourcecodeService.create({
        nom_codigo_fuente: this.encryptionService.encrypt(zipFile.filename),
        nom_directorio: this.encryptionService.encrypt(zipFile.destination)
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
        relations: ['applicationstatus', 'user']
      });
      if (!application) throw new NotFoundException(`Application with ${id} not found `);


      const estatu = await this.estatusService.findOne(estatusId);

      if (!estatu) {
        throw new Error(`Estatus with ID ${estatusId} not found`);
      }

      application.applicationstatus = estatu;
      await this.applicationRepository.save(application);

      application.nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);

      return application;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  async getStaticFileZip(id: number, response): Promise<void> {
    // Buscar la aplicación en el repositorio
    const application = await this.applicationRepository.findOne({
      where: { idu_aplicacion: id },
      relations: ['applicationstatus', 'user', 'scans']
    });

    // Verificar si la aplicación existe
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }

    // Desencriptar el nombre de la aplicación para obtener el nombre de la carpeta
    const decryptedAppName = this.encryptionService.decrypt(application.nom_aplicacion);
    const directoryPath = join(this.downloadPath, decryptedAppName);

    // Verificar si el directorio existe
    if (!existsSync(directoryPath)) {
      throw new BadRequestException(`No directory found with name ${decryptedAppName}`);
    }

    // Configurar el encabezado de la respuesta para descarga de archivo ZIP
    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-Disposition', `attachment; filename="${decryptedAppName}.zip"`);

    // Crear un archivo ZIP y transmitirlo a la respuesta
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      throw new BadRequestException(`Error while archiving: ${err.message}`);
    });

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

    await new Promise<void>((resolve, reject) => {
      archive.finalize()
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }


  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    if (error.response)
      throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }
}
