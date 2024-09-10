import { Module } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { RviaController } from './rvia.controller';
import { ApplicationsModule } from 'src/applications/applications.module';
import { CommonModule } from 'src/common/common.module';
import { CheckmarxModule } from 'src/checkmarx/checkmarx.module';

@Module({
  controllers: [RviaController],
  providers: [RviaService],
  imports:[
    ApplicationsModule,
    CommonModule,
    CheckmarxModule,
  ]
})
export class RviaModule {}
