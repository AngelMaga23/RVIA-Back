import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PositionsModule } from './positions/positions.module';
import { ApplicationsModule } from './applications/applications.module';
import { SourcecodeModule } from './sourcecode/sourcecode.module';
import { ScansModule } from './scans/scans.module';
import { ApplicationstatusModule } from './applicationstatus/applicationstatus.module';
import { CommonModule } from './common/common.module';
import { UsersApplicationsModule } from './users-applications/users-applications.module';
import { RviaModule } from './rvia/rvia.module';
import { CheckmarxModule } from './checkmarx/checkmarx.module';
import { CostModule } from './cost/cost.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:false
    }),

    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname,'..','public'), 
    // }),


    PositionsModule,
    ApplicationsModule,
    SourcecodeModule,
    ScansModule,
    ApplicationstatusModule,
    CommonModule,
    UsersApplicationsModule,
    RviaModule,
    CheckmarxModule,
    CostModule
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
