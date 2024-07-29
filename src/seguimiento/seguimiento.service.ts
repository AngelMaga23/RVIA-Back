import { Injectable } from '@nestjs/common';
import { CreateSeguimientoDto } from './dto/create-seguimiento.dto';
import { UpdateSeguimientoDto } from './dto/update-seguimiento.dto';

@Injectable()
export class SeguimientoService {
  create(createSeguimientoDto: CreateSeguimientoDto) {
    return 'This action adds a new seguimiento';
  }

  findAll() {
    return `This action returns all seguimiento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} seguimiento`;
  }

  update(id: number, updateSeguimientoDto: UpdateSeguimientoDto) {
    return `This action updates a #${id} seguimiento`;
  }

  remove(id: number) {
    return `This action removes a #${id} seguimiento`;
  }
}
