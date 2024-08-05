import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LanguagesService } from './languages.service';
import { LanguagesController } from './languages.controller';
import { Language } from './entities/language.entity';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService],
  imports: [ 
    TypeOrmModule.forFeature([ Language ]),
    CommonModule,
    AuthModule
  ],
  exports:[LanguagesService]
})
export class LanguagesModule {}
