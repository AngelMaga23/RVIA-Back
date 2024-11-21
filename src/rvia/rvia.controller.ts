import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RviaService } from './rvia.service';
import { CreateRviaDto } from './dto/create-rvia.dto';
import { UpdateRviaDto } from './dto/update-rvia.dto';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, UnauthorizedResponse } from 'src/common/dto';
import { CreateResponseDto } from './dto/create-response.dto';

@Controller('rvia')
export class RviaController {
  constructor(private readonly rviaService: RviaService) {}


  @ApiParam({ name: 'idu_aplicacion', description: 'ID de la aplicación', example: 1 })
  @ApiParam({ name: 'conIA', description: 'Indica si se trabajará con IA', example: 1 })
  @ApiParam({ name: 'opc_arquitectura', description: 'Opción de la arquitectura seleccionada', example: 1 })
  @ApiResponse({ status:201, description:'Se realizó la conexión del RVIA correctamente', type: CreateResponseDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  create(@Body() createRviaDto: CreateRviaDto) {
    return this.rviaService.create(createRviaDto);
  }


  @ApiResponse({ status:200, description:'Se obtiene la versión del rvia'})
  findAll() {
    return this.rviaService.getVersion();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.rviaService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateRviaDto: UpdateRviaDto) {
  //   return this.rviaService.update(+id, updateRviaDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.rviaService.remove(+id);
  // }
}
