import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { Position } from './entities/position.entity';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class PositionsService {

  private readonly logger = new Logger('PositionsService');

  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
    private readonly encryptionService: CommonService
  ){}

  async create(createPositionDto: CreatePositionDto) {
    
     try {
        
        createPositionDto.nom_puesto = this.encryptionService.encrypt(createPositionDto.nom_puesto);
        const position = this.positionRepository.create(createPositionDto);
        await this.positionRepository.save(position);

        return position;

     } catch (error) {

        this.handleDBExceptions( error );
     }

  }

  async findAll() {

    try {
      const puestos = await this.positionRepository.find();

      const decryptedStatuses = puestos.map(puesto => {
        puesto.nom_puesto = this.encryptionService.decrypt(puesto.nom_puesto);
        return puestos;
      });
  
      return puestos;
    } catch (error) {
      this.handleDBExceptions( error ); 
    }

    // return this.positionRepository.find();
  }

  async findOne(id: number) {

    const position = await this.positionRepository.findOneBy({ idu_puesto:id });

    if( !position )
      throw new NotFoundException(`Position with ${id} not found `);
    position.nom_puesto = this.encryptionService.decrypt(position.nom_puesto);
    return position; 
  }

  async update(id: number, updatePositionDto: UpdatePositionDto) {

    const position = await this.positionRepository.preload({
      idu_puesto: id,
      ...updatePositionDto
    });

    if( !position ) throw new NotFoundException(`Position with ${id} not found `);

    try {
      position.nom_puesto = this.encryptionService.encrypt(position.nom_puesto);
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
