import { Module } from '@nestjs/common';
import { ApplicationstatusService } from './applicationstatus.service';
import { ApplicationstatusController } from './applicationstatus.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Applicationstatus } from './entities/applicationstatus.entity';

@Module({
  controllers: [ApplicationstatusController],
  providers: [ApplicationstatusService],
  imports: [
    TypeOrmModule.forFeature([Applicationstatus])
  ]
})
export class ApplicationstatusModule {}
