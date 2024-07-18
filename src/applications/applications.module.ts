import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  imports:[
    TypeOrmModule.forFeature([ Application ])
  ]
})
export class ApplicationsModule {}
