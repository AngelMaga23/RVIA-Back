import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionsModule } from './positions/positions.module';
import { UsersModule } from './users/users.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { SourcecodeModule } from './sourcecode/sourcecode.module';
import { ScansModule } from './scans/scans.module';
import { ApplicationstatusModule } from './applicationstatus/applicationstatus.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type:'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize:true
    }),

    PositionsModule,
    UsersModule,
    ApplicationsModule,
    AuthModule,
    SourcecodeModule,
    ScansModule,
    ApplicationstatusModule,
    CommonModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
