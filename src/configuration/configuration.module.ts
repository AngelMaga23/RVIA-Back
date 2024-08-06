import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfiguracionService } from './configuracion.service';
import { Configuration } from './entities/configuration.entity';
import { ConfiguracionController } from './configuration.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ Configuration ])],
  // controllers: [ConfiguracionController],
  providers: [ConfiguracionService],
  exports: [TypeOrmModule, ConfiguracionService],
})
export class ConfigurationModule {}
