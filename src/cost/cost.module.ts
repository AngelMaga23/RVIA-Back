import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CostService } from './cost.service';
import { CostController } from './cost.controller';
import { Cost } from './entities/cost.entity';

@Module({
  controllers: [CostController],
  providers: [CostService],
  imports:[
    TypeOrmModule.forFeature([ Cost ]),
  ],
})
export class CostModule {}
