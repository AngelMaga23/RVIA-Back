import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicationstatusService } from './applicationstatus.service';
import { CreateApplicationstatusDto } from './dto/create-applicationstatus.dto';
import { UpdateApplicationstatusDto } from './dto/update-applicationstatus.dto';
import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, UnauthorizedResponse } from 'src/common/dto';
import { Auth } from 'src/auth/decorators';
import { Applicationstatus } from './entities/applicationstatus.entity';
import { ValidRoles } from 'src/auth/interfaces';


@ApiTags('Estatus Aplicaciones')
@Controller('applicationstatus')
export class ApplicationstatusController {
  constructor(private readonly applicationstatusService: ApplicationstatusService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiResponse({ status:201, description:'Estatus creado correctamente', type: Applicationstatus})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  create(@Body() createApplicationstatusDto: CreateApplicationstatusDto) {
    return this.applicationstatusService.create(createApplicationstatusDto);
  }

  @Get()
  @ApiResponse({ status:200, description:'Listado de los estatus', type: [Applicationstatus]})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  findAll() {
    return this.applicationstatusService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status:200, description:'Estatus', type: Applicationstatus })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationstatusService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.admin)
  @ApiResponse({ status:200, description:'Actualización del Estatus', type: Applicationstatus })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateApplicationstatusDto: UpdateApplicationstatusDto) {
    return this.applicationstatusService.update(id, updateApplicationstatusDto);
  }

  // @Delete(':id')
  // @Auth(ValidRoles.admin)
  // @ApiResponse({ status:200, description:'Actualización del Estatus', type: Applicationstatus })
  // @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  // @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  // @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  // @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  // remove(@Param('id') id: string) {
  //   return this.applicationstatusService.remove(+id);
  // }
}
