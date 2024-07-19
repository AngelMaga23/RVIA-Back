import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Application } from './entities/application.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApplicationstatusService } from '../applicationstatus/applicationstatus.service';
import { SourcecodeService } from '../sourcecode/sourcecode.service';

@Injectable()
export class ApplicationsService {

  private readonly logger = new Logger('ApplicationsService');

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepository: Repository<Application>,
    private readonly estatusService: ApplicationstatusService,
    private readonly sourcecodeService: SourcecodeService,
  ){}



  create(createApplicationDto: CreateApplicationDto) {
    return 'This action adds a new application';
  }

  async createFile(file){

    try {


      const estatu = await this.estatusService.findOne(2);

      const sourcecode = await this.sourcecodeService.create({
         name: file.filename,
         directory: file.destination
      });

      const nameApplication = file.originalname.split('.')[0];

      const application = new Application();
      application.name = nameApplication;
      application.applicationstatus = estatu;
      application.sourcecode = sourcecode;

      // Guarda la nueva aplicación en la base de datos
      await this.applicationRepository.save(application);

      return application;

   } catch (error) {

      this.handleDBExceptions( error );
   }

    return file.originalname;
  }

   

  // findOne(id: number) {
  //   return `This action returns a #${id} application`;
  // }

  // update(id: number, updateApplicationDto: UpdateApplicationDto) {
  //   return `This action updates a #${id} application`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} application`;
  // }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }
}
