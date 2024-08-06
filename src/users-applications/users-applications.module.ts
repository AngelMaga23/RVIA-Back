import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersApplicationsService } from './users-applications.service';
import { UsersApplicationsController } from './users-applications.controller';
import { UsersApplication } from './entities/users-application.entity';
import { ApplicationsModule } from 'src/applications/applications.module';
import { AuthModule } from '../auth/auth.module';


@Module({
  imports:[
    TypeOrmModule.forFeature([ UsersApplication ]),
    ApplicationsModule,
    AuthModule
  ],
  controllers: [UsersApplicationsController],
  providers: [UsersApplicationsService],
})
export class UsersApplicationsModule {}
