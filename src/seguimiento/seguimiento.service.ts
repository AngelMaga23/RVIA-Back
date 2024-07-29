import { Injectable } from '@nestjs/common';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Seguimiento } from './entities/seguimiento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeguimientoService {

  constructor(
    @InjectRepository(Seguimiento)
    private seguimientoRepository: Repository<Seguimiento>,
  ) {}

  create(createSeguimientoDto: CreateSeguimientoDto) {
    const auditoriaGlobal = this.seguimientoRepository.create(createSeguimientoDto);
    return this.seguimientoRepository.save(auditoriaGlobal);
  }


}
