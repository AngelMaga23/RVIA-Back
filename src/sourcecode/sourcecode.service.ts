import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateSourcecodeDto } from './dto/create-sourcecode.dto';
import { UpdateSourcecodeDto } from './dto/update-sourcecode.dto';
import { Sourcecode } from './entities/sourcecode.entity';


@Injectable()
export class SourcecodeService {

  private readonly logger = new Logger('SourcecodeService');

  constructor(
    @InjectRepository(Sourcecode)
    private readonly sourceCodeRepository: Repository<Sourcecode>
  ){}

  async create(createSourcecodeDto: CreateSourcecodeDto) {
    try {
        
      const source = this.sourceCodeRepository.create(createSourcecodeDto);
      await this.sourceCodeRepository.save(source);

      return source;

   } catch (error) {

      this.handleDBExceptions( error );
   }
  }

  findAll() {
    return this.sourceCodeRepository.find();
  }

  async findOne(id: number) {
    const source = await this.sourceCodeRepository.findOneBy({ id });

    if( !source )
      throw new NotFoundException(`source with ${id} not found `);

    return source; 
  }

  // update(id: number, updateSourcecodeDto: UpdateSourcecodeDto) {
  //   return `This action updates a #${id} sourcecode`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} sourcecode`;
  // }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
