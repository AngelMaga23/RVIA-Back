import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, StreamableFile } from '@nestjs/common';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs/promises';
import { createReadStream, existsSync, promises as fsPromises } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';


import { CreateCheckmarxDto } from './dto/create-checkmarx.dto';
import { UpdateCheckmarxDto } from './dto/update-checkmarx.dto';
import { ApplicationsService } from '../applications/applications.service';
import { CommonService } from 'src/common/common.service';
import { Checkmarx } from './entities/checkmarx.entity';

import { Application } from 'src/applications/entities/application.entity';


@Injectable()
export class CheckmarxService {


  constructor(

    @InjectRepository(Checkmarx)
    private readonly checkmarxRepository: Repository<Checkmarx>,
    @Inject(forwardRef(() => ApplicationsService)) // Usamos forwardRef aquí
    private readonly applicationService: ApplicationsService,
    private readonly encryptionService: CommonService,

  ) {}

  async create(createCheckmarxDto: CreateCheckmarxDto, file) {

    try {

      const aplicacion = await this.applicationService.findOne(createCheckmarxDto.idu_aplicacion);
      const nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
      const fileName = `checkmarx_${nom_aplicacion}.csv`;
      const finalFilePath = join(`/tmp/bito/${nom_aplicacion}`, fileName);

      await rename(`/tmp/bito/${file.filename}`, finalFilePath);  
 
      const checkmarx = new Checkmarx();
      checkmarx.nom_checkmarx = this.encryptionService.encrypt(fileName);
      checkmarx.nom_directorio = this.encryptionService.encrypt(finalFilePath);
      checkmarx.application = aplicacion;

      await this.checkmarxRepository.save(checkmarx); 

      checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
      checkmarx.nom_directorio = this.encryptionService.decrypt(checkmarx.nom_directorio);

      return checkmarx;

    } catch (error) {
      throw new InternalServerErrorException('Error al subir csv', error.message);
    }

  }

  async convertPDF(createCheckmarxDto: CreateCheckmarxDto, file) {

    try {

      const aplicacion = await this.applicationService.findOne(createCheckmarxDto.idu_aplicacion);

      if(aplicacion.num_accion != 2)
        throw new NotFoundException(` La aplicación debe tener la acción de Sanitización `);

      
      const res = await this.callPython( aplicacion.nom_aplicacion, file.filename, aplicacion );
 

      return res;
    } catch (error) {
      throw new InternalServerErrorException('Error al subir csv', error.message);
    }

  }

  findAll() {
    return `This action returns all checkmarx`;
  }

  async findOneByApplication(id: number) {

    const aplicacion = await this.applicationService.findOne(id);

    const checkmarx = await this.checkmarxRepository.findOneBy({ application: aplicacion });

    // if(!checkmarx)
    //   throw new NotFoundException(`Csv no encontrado `);
    if(checkmarx){
      checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
      checkmarx.nom_directorio = this.encryptionService.decrypt(checkmarx.nom_directorio);
    }


    return !checkmarx ? [] : checkmarx;
  }

  async downloadCsvFile(id: number, response): Promise<void> {

    const checkmarx = await this.checkmarxRepository.findOneBy({ idu_checkmarx:id });

    if (!checkmarx) {
      throw new NotFoundException('Archivo no encontrado');
    }
    
    checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
    checkmarx.nom_directorio = this.encryptionService.decrypt(checkmarx.nom_directorio);

    const filePath = join(checkmarx.nom_directorio);

    if (!existsSync(filePath)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    response.setHeader('Content-Type', 'text/csv');
    response.setHeader('Content-Disposition', `attachment; filename="${checkmarx.nom_checkmarx}"`);

    const fileStream = createReadStream(filePath);

    fileStream.on('error', (error) => {
      console.error('Error al leer el archivo:', error);
      response.status(500).send('Error al leer el archivo');
    });

    fileStream.pipe(response);
  }

  remove(id: number) {
    return `This action removes a #${id} checkmarx`;
  }

  async callPython(nameApplication:string, namePdf:string, application: Application){

    const scriptPath = join(__dirname, '../..', 'src/python-scripts','recovery.py');
    const requirementsPath = join(__dirname, '../..', 'src/python-scripts', 'requirements.txt');

    const execPromise = promisify(exec);
    const nom_aplicacion = this.encryptionService.decrypt(application.nom_aplicacion);
    const fileName = `checkmarx_${nom_aplicacion}.csv`;
    const finalFilePath = join(`/tmp/bito/${nom_aplicacion}`, fileName);

    try {
      await fsPromises.access(scriptPath, fsPromises.constants.F_OK | fsPromises.constants.R_OK);

      // await execPromise(`sudo pip3 install -r ${requirementsPath}`);

      const escapedFileName1 = `"${nom_aplicacion.replace(/"/g, '\\"')}"`;
      const escapedFileName2 = `"${namePdf.replace(/"/g, '\\"')}"`;
  
      const command = `python3 ${scriptPath} ${escapedFileName1} ${escapedFileName2}`;
  
      const { stdout, stderr } = await execPromise(command);
  
      if (stderr) {
        throw new InternalServerErrorException('Error al ejecutar el script');
      }

      const checkmarx = new Checkmarx();
      checkmarx.nom_checkmarx = this.encryptionService.encrypt(fileName);
      checkmarx.nom_directorio = this.encryptionService.encrypt(finalFilePath);
      checkmarx.application = application;

      await this.checkmarxRepository.save(checkmarx);

      checkmarx.nom_checkmarx = this.encryptionService.decrypt(checkmarx.nom_checkmarx);
  
      return checkmarx;
    } catch (error) {
      // return { message: 'Error al ejecutar el comando.', error: error.message };
      throw new InternalServerErrorException('Error al ejecutar el script');
    }
  }

}
