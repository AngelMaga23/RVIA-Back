import { Injectable } from '@nestjs/common';
import { CreateSourcecodeDto } from './dto/create-sourcecode.dto';
import { UpdateSourcecodeDto } from './dto/update-sourcecode.dto';

@Injectable()
export class SourcecodeService {
  create(createSourcecodeDto: CreateSourcecodeDto) {
    return 'This action adds a new sourcecode';
  }

  findAll() {
    return `This action returns all sourcecode`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sourcecode`;
  }

  update(id: number, updateSourcecodeDto: UpdateSourcecodeDto) {
    return `This action updates a #${id} sourcecode`;
  }

  remove(id: number) {
    return `This action removes a #${id} sourcecode`;
  }
}
