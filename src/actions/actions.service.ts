import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';
import { UpdateActionDto } from './dto/update-action.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';

@Injectable()
export class ActionsService {

  private readonly logger = new Logger('ActionsService');

  constructor(
    @InjectRepository(Action)
    private readonly actionRepository: Repository<Action>,
    private readonly encryptionService: CommonService
  ) { }

  create(createActionDto: CreateActionDto) {
    return 'This action adds a new action';
  }

  findAll() {
    return `This action returns all actions`;
  }

  async findOne(id: number) {
    const action = await this.actionRepository.findOneBy({ idu_accion: id });

    if (!action)
      throw new NotFoundException(`Accion con ${id} no encontrado `);

    return action;
  }

  update(id: number, updateActionDto: UpdateActionDto) {
    return `This action updates a #${id} action`;
  }

  remove(id: number) {
    return `This action removes a #${id} action`;
  }
}
