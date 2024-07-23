import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationstatusService } from '../applicationstatus/applicationstatus.service';
import { SourcecodeService } from '../sourcecode/sourcecode.service';
import { catchError, lastValueFrom } from 'rxjs';
import { createReadStream, createWriteStream, existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import * as unzipper from 'unzipper';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../auth/entities/user.entity';
import { ValidRoles } from '../auth/interfaces/valid-roles';

@Injectable()
export class ApplicationsService {

  private readonly logger = new Logger('ApplicationsService');
  // private readonly downloadPath = join(process.cwd(), 'static', 'zip');
  private downloadPath = './static/zip';

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly estatusService: ApplicationstatusService,
    private readonly sourcecodeService: SourcecodeService,
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ){
    this.ensureDirectoryExists(this.downloadPath);
  }

  async findAll(user: User) {
 
    if( user.position !== null && user.position.nom_puesto == ValidRoles.admin  ){
      return await this.applicationRepository.find();
    }
    return await this.applicationRepository.find({
      where: { user: { idu_usuario: user.idu_usuario } },
    });
  }

  private ensureDirectoryExists(directory: string): void {
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true });
    }
  }

  async createGitFile(createApplicationDto: CreateApplicationDto, user: User)
  {

    try {
      const repoName = this.getRepoName(createApplicationDto.url);
      const repoUserName = this.getUserName(createApplicationDto.url);

      // Generar una carpeta para el repositorio
      const repoFolderPath = join(this.downloadPath, repoName);
      mkdirSync(repoFolderPath, { recursive: true });

      const zipUrl = `https://github.com/${repoUserName}/${repoName}/archive/refs/heads/main.zip`;

      const response = await lastValueFrom(
        this.httpService.get(zipUrl, { responseType: 'stream' }).pipe(
          catchError((err) => {
            throw new InternalServerErrorException('Error al descargar el repositorio');
          }),
        ),
      );

      // const storage =   ({
      //   destination: this.downloadPath,
      //   filename: (req, file, cb) => {
      //     const fileExtName = extname(file.originalname);
      //     const randomName = uuidv4() + fileExtName;  
      //     cb(null, `${repoName}-${randomName}`);
      //   },
      // });

      const zipFilename = `${repoName}-${uuidv4()}.zip`;
      const zipPath = join(repoFolderPath, zipFilename);
      const writeStream = createWriteStream(zipPath);
      response.data.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });

      const estatu = await this.estatusService.findOne(2);

      const sourcecode = await this.sourcecodeService.create({
         nom_codigo_fuente: zipFilename,
         nom_directorio: zipPath
      });

      const application = new Application();
      application.nom_aplicacion = repoName;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      await this.applicationRepository.save(application);

      return application;

    } catch (error) {
      this.handleDBExceptions( error );
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

  private async extractZip(zipPath: string, repoName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: join(this.downloadPath, repoName) }))
        .on('close', resolve)
        .on('error', reject);
    });
  }

  async createFile(file, user: User){

    try {


      const estatu = await this.estatusService.findOne(2);

      const sourcecode = await this.sourcecodeService.create({
         nom_codigo_fuente: file.filename,
         nom_directorio: file.destination
      });

      const nameApplication = file.originalname.split('.')[0];

      const application = new Application();
      application.nom_aplicacion = nameApplication;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;
      application.user = user;

      // Guarda la nueva aplicación en la base de datos
      await this.applicationRepository.save(application);

      return application;

   } catch (error) {

      this.handleDBExceptions( error );
   }

    return file.originalname;
  }

  async update(id: number, estatusId: number) {

    try {
      const application = await this.applicationRepository.findOne({
        where: { idu_aplicacion:id },
        relations: ['applicationstatus', 'user']
      });
      if( !application ) throw new NotFoundException(`Application with ${id} not found `);
  
  
      const estatu = await this.estatusService.findOne(estatusId);
  
      if (!estatu) {
        throw new Error(`Estatus with ID ${estatusId} not found`);
      }

      application.applicationstatus = estatu;
      await this.applicationRepository.save(application)

      return application;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }


  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    if( error.response )
      throw new BadRequestException(error.message);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }
}
