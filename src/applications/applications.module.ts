import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { ApplicationstatusModule } from '../applicationstatus/applicationstatus.module';
import { SourcecodeModule } from '../sourcecode/sourcecode.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  imports:[
    TypeOrmModule.forFeature([ Application ]),
    ApplicationstatusModule,
    SourcecodeModule,
    HttpModule
  ]
})
export class ApplicationsModule {}
