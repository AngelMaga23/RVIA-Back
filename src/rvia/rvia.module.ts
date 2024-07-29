import { Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';

@Module({
  controllers: [RviaController],
  providers: [RviaService],
})
export class RviaModule {}
