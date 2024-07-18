import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number) {

    const position = await this.positionRepository.findOneBy({ id });

    if( !position )
      throw new NotFoundException(`Position with ${id} not found `);

    return position; 
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {

    const position = await this.positionRepository.preload({
      id: id,
      ...updatePositionDto
    });

    if( !position ) throw new NotFoundException(`Position with ${id} not found `);

    try {
      await this.positionRepository.save( position );
      return position;

    } catch (error) {
      this.handleDBExceptions(error);
    }

    return position;
  }

  async remove(id: number) {

    const position = await this.findOne( id );
    await this.positionRepository.remove( position );

    // return `This action removes a #${id} position`;
  }

  private handleDBExceptions( error:any ){
    if( error.code === '23505' )
      throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException("Unexpected error, check server logs");
  }

}
