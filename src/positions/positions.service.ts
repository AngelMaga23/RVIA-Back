import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionsService {

  private readonly logger = new Logger('PositionsService');

  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>
  ){}

  async create(createPositionDto: CreatePositionDto) {
    
     try {
        
        const position = this.positionRepository.create(createPositionDto);
        await this.positionRepository.save(position);

        return position;

     } catch (error) {

        this.handleDBExceptions( error );
     }

  }

  findAll() {
    return this.positionRepository.find();
  }

  findOne(id: number) {
    return this.positionRepository.findOneBy({ id }); 
  }

  update(id: number, updatePositionDto: UpdatePositionDto) {
    return `This action updates a #${id} position`;
  }

  remove(id: number) {
    return `This action removes a #${id} position`;
  }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
