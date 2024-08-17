import { Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';
import { ApplicationsModule } from 'src/applications/applications.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [RviaController],
  providers: [RviaService],
  imports:[
    ApplicationsModule,
    CommonModule
  ]
})
export class RviaModule {}
