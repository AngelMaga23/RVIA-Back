import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { rename } from 'fs/promises';

import { CreateCheckmarxDto } from './dto/create-checkmarx.dto';
import { UpdateCheckmarxDto } from './dto/update-checkmarx.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { CommonService } from 'src/common/common.service';
import { Checkmarx } from './entities/checkmarx.entity';

@Injectable()
export class CheckmarxService {


  constructor(

    @InjectRepository(Checkmarx)
    private readonly checkmarxRepository: Repository<Checkmarx>,
    private readonly applicationService: ApplicationsService,
    private readonly encryptionService: CommonService,

  ) {}

  async create(createCheckmarxDto: CreateCheckmarxDto, file) {

    try {

      const aplicacion = await this.applicationService.findOne(createCheckmarxDto.idu_aplicacion);
      const nom_aplicacion = this.encryptionService.decrypt(aplicacion.nom_aplicacion);
      const fileName = `checkmarx_${nom_aplicacion}.csv`;
      const finalFilePath = join(this.encryptionService.decrypt(aplicacion.sourcecode.nom_directorio), fileName);

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

  update(id: number, updateCheckmarxDto: UpdateCheckmarxDto) {
    return `This action updates a #${id} checkmarx`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkmarx`;
  }


}
