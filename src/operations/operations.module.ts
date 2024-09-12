import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { Operation } from './entities/operation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { ActionsModule } from 'src/actions/actions.module';

@Module({
  controllers: [OperationsController],
  providers: [OperationsService],
  imports:[
    TypeOrmModule.forFeature([ Operation ]),
    CommonModule,
    ActionsModule
  ],
  exports:[
    OperationsService,
    TypeOrmModule
  ]
})
export class OperationsModule {}
