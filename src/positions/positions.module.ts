import { forwardRef, Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Position } from './entities/position.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService],
  imports: [ 
    TypeOrmModule.forFeature([ Position ]),
    forwardRef(() => AuthModule),
  ],
  exports:[PositionsService]
})
export class PositionsModule {}
