import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateOperationDto } from './dto/create-operation.dto';
import { UpdateOperationDto } from './dto/update-operation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Operation } from './entities/operation.entity';
import { In, Repository } from 'typeorm';
import { CommonService } from 'src/common/common.service';
import { Application } from 'src/applications/entities/application.entity';
import { Applicationstatus } from 'src/applicationstatus/entities/applicationstatus.entity';
import { ActionsService } from 'src/actions/actions.service';

@Injectable()
export class OperationsService {

  private readonly logger = new Logger('OperationsService');

  constructor(
    @InjectRepository(Operation)
    private readonly operationRepository: Repository<Operation>,
    private readonly encryptionService: CommonService,
    private readonly actionsService: ActionsService,
  ) { }


  create(createOperationDto: CreateOperationDto) {
    return 'This action adds a new operation';
  }

  async createByActions(acciones:number[], aplicacion:Application, estatus:Applicationstatus) {

    const operations: Operation[] = [];

    for (const idu_accion of acciones) {
      // Verifica si la acción existe
      const accion = await this.actionsService.findOne( idu_accion );
        // Crea la nueva operación
      const newOperation = this.operationRepository.create({
          application:aplicacion,
          action:accion,
          applicationstatus:estatus,
          costo:0,
      });

      const savedOperation = await this.operationRepository.save(newOperation);
      operations.push(savedOperation);
    }

    return operations;
  }


  findAll() {
    return `This action returns all operations`;
  }

  async findByproject( idu_aplicacion:number ) {

    const operations = await this.operationRepository.find({
      where: {
          application: { idu_aplicacion },
      },
      relations: ['application', 'action', 'applicationstatus'],
    });

    return operations;
    
  }

  async findOne(id: number) {
    const operacion = await this.operationRepository.findOneBy({ idu_operacion: id });

    if (!operacion)
      throw new NotFoundException(`Operacion con ${id} no encontrado `);

    return operacion;
  }

  async findByOptions(options: number[]) {

    const accionesExistentes = await this.operationRepository.findBy({
      idu_operacion: In(options),
    });

    const accionesIds = accionesExistentes.map(accion => accion.idu_operacion);

    const accionesFaltantes = options.filter(option => !accionesIds.includes(option));

    if (accionesFaltantes.length > 0) {
      throw new NotFoundException(`Las siguientes acciones no se encontraron: ${accionesFaltantes.join(', ')}`);
    }

  }

  update(id: number, updateOperationDto: UpdateOperationDto) {
    return `This action updates a #${id} operation`;
  }

  remove(id: number) {
    return `This action removes a #${id} operation`;
  }
}
