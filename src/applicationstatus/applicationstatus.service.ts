import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateApplicationstatusDto } from './dto/create-applicationstatus.dto';
import { UpdateApplicationstatusDto } from './dto/update-applicationstatus.dto';
import { Applicationstatus } from './entities/applicationstatus.entity';



@Injectable()
export class ApplicationstatusService {

  private readonly logger = new Logger('ApplicationstatusService');

  constructor(
    @InjectRepository(Applicationstatus)
    private readonly applicationStatusRepository: Repository<Applicationstatus>
  ){}

  async create(createApplicationstatusDto: CreateApplicationstatusDto) {
    try {
        
      const status = this.applicationStatusRepository.create(createApplicationstatusDto);
      await this.applicationStatusRepository.save(status);

      return status;

    } catch (error) {
      this.handleDBExceptions( error ); 
    }
  }

  findAll() {
    return this.applicationStatusRepository.find();
  }

  async findOne(id: number) {
    const status = await this.applicationStatusRepository.findOneBy({ id });

    if( !status )
      throw new NotFoundException(`status with ${id} not found `);

    return status;
  }

  async update(id: number, updateApplicationstatusDto: UpdateApplicationstatusDto) {
    const statu = await this.applicationStatusRepository.preload({
      id: id,
      ...updateApplicationstatusDto
    });

    if( !statu ) throw new NotFoundException(`Position with ${id} not found `);

    try {
      await this.applicationStatusRepository.save( statu );
      return statu;

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }

  remove(id: number) {
    return `This action removes a #${id} applicationstatus`;
  }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
