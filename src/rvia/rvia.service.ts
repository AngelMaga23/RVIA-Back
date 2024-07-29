import { Injectable } from '@nestjs/common';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';

@Injectable()
export class RviaService {
  create(createRviaDto: CreateRviaDto) {
    return 'This action adds a new rvia';
  }

  findAll() {
    return `This action returns all rvia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rvia`;
  }

  update(id: number, updateRviaDto: UpdateRviaDto) {
    return `This action updates a #${id} rvia`;
  }

  remove(id: number) {
    return `This action removes a #${id} rvia`;
  }
}
