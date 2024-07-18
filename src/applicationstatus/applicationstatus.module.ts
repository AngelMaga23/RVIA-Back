import { Module } from '@nestjs/common';
import { ApplicationstatusService } from './applicationstatus.service';
import { ApplicationstatusController } from './applicationstatus.controller';

@Module({
  controllers: [ApplicationstatusController],
  providers: [ApplicationstatusService],
})
export class ApplicationstatusModule {}
