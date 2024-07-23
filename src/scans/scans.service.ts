import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateScanDto } from './dto/create-scan.dto';
import { UpdateScanDto } from './dto/update-scan.dto';
import { Scan } from './entities/scan.entity';


@Injectable()
export class ScansService {

  private readonly logger = new Logger('ScansService');

  constructor(
    @InjectRepository(Scan)
    private readonly scanRepository: Repository<Scan>
  ){}

  async create(createScanDto: CreateScanDto) {
    try {
        
      const scan = this.scanRepository.create(createScanDto);
      await this.scanRepository.save(scan);

      return scan;

    } catch (error) {
      this.handleDBExceptions( error ); 
    }
  }

  findAll() {
    return this.scanRepository.find();
  }

  async findOne(id: number) {
    const scan = await this.scanRepository.findOneBy({ idu_escaneo:id });

    if( !scan )
      throw new NotFoundException(`scan with ${id} not found `);

    return scan; 
  }

  // update(id: number, updateScanDto: UpdateScanDto) {
  //   return `This action updates a #${id} scan`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} scan`;
  // }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
