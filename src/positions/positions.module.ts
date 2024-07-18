import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  imports: [ 
    TypeOrmModule.forFeature([ Position ])
  ],
  exports:[PositionsService]
})
export class PositionsModule {}
