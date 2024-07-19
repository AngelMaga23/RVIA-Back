import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { PositionsModule } from '../positions/positions.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [ 
    TypeOrmModule.forFeature([ User ]),
    PositionsModule
  ]
})
export class AuthModule {}
