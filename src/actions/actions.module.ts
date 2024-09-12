import { Module } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { ActionsController } from './actions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Action } from './entities/action.entity';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [ActionsController],
  providers: [ActionsService],
  imports:[
    TypeOrmModule.forFeature([ Action ]),
    CommonModule,
  ],
  exports:[
    ActionsService,
    TypeOrmModule
  ]
})
export class ActionsModule {}
