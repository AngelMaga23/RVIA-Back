import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CheckmarxService } from './checkmarx.service';
import { CheckmarxController } from './checkmarx.controller';
import { Checkmarx } from './entities/checkmarx.entity';
import { ApplicationsModule } from 'src/applications/applications.module';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports:[ TypeOrmModule.forFeature([ Checkmarx ]), ApplicationsModule, CommonModule,AuthModule ],
  controllers: [CheckmarxController],
  providers: [CheckmarxService],
})
export class CheckmarxModule {}
