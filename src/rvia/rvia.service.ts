import { Injectable } from '@nestjs/common';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';
const addon = require('/sysx/progs/rvia/bin/rvia');

@Injectable()
export class RviaService {
  create(createRviaDto: CreateRviaDto) {

    const obj = new addon.CIAJASR(200, 2);
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
