import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';

import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, NotFoundExceptionResponse, UnauthorizedResponse } from 'src/common/dto';

import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from '../auth/decorators';
import { Position } from './entities/position.entity';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';


@ApiTags('Roles')
@Controller('positions')
@Auth( ValidRoles.admin )
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @Auth( ValidRoles.admin )
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id', description: 'ID del lenguaje de programación' })
  @ApiResponse({ status:200, description:'Objeto actualizado', type: Position })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:404, description:'Ocurre cuándo no existe el dato o archivo', type: NotFoundExceptionResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }
}
