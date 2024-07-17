import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './entities/position.entity';

@Injectable()
export class PositionsService {

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
        console.log(error)
        throw new InternalServerErrorException("Ayuda!!!");
     }

  }

  findAll() {
    return `This action returns all positions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} position`;
  }

  update(id: number, updatePositionDto: UpdatePositionDto) {
    return `This action updates a #${id} position`;
  }

  remove(id: number) {
    return `This action removes a #${id} position`;
  }
}
