import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ConfiguracionService } from './configuracion.service';
import { CreateConfigurationDto } from './dto/create-configuration.dto';
import { UpdateConfigurationDto } from './dto/update-configuration.dto';

@Controller('configuracion')
export class ConfiguracionController {
  constructor(private readonly configuracionService: ConfiguracionService) {}

  // @Post()
  // create(@Body() createConfiguracionDto: CreateConfiguracionDto) {
  //   return this.configuracionService.create(createConfiguracionDto);
  // }

  // @Get()
  // findAll() {
  //   return this.configuracionService.loadConfig();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.configuracionService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateConfiguracionDto: UpdateConfiguracionDto) {
  //   return this.configuracionService.update(+id, updateConfiguracionDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.configuracionService.remove(+id);
  // }
}
