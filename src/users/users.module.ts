import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PositionsModule } from 'src/positions/positions.module';


@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [ 
    TypeOrmModule.forFeature([ User ]),
    PositionsModule
  ]
})
export class UsersModule {}
