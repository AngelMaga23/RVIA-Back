import { Injectable } from '@nestjs/common';
import { CreateApplicationstatusDto } from './dto/create-applicationstatus.dto';
import { UpdateApplicationstatusDto } from './dto/update-applicationstatus.dto';

@Injectable()
export class ApplicationstatusService {
  create(createApplicationstatusDto: CreateApplicationstatusDto) {
    return 'This action adds a new applicationstatus';
  }

  findAll() {
    return `This action returns all applicationstatus`;
  }

  findOne(id: number) {
    return `This action returns a #${id} applicationstatus`;
  }

  update(id: number, updateApplicationstatusDto: UpdateApplicationstatusDto) {
    return `This action updates a #${id} applicationstatus`;
  }

  remove(id: number) {
    return `This action removes a #${id} applicationstatus`;
  }
}
