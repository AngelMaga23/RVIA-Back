import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, NotFoundExceptionResponse, UnauthorizedResponse } from 'src/common/dto';

import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { Auth } from '../auth/decorators';
import { Language } from './entities/language.entity';



@ApiTags('Lenguajes de Programación')
@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Post()
  @ApiParam({ name: 'nom_lenguaje', description: 'Nombre del lenguaje de programación' })
  @ApiResponse({ status:200, description:'Objeto creado', type: Language })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth( ValidRoles.admin )
  create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languagesService.create(createLanguageDto);
  }

  @Get()
  @ApiResponse({ status:200, description:'Lista de lenguajes obtenidos', type: [Language] })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  findAll() {
    return this.languagesService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID del lenguaje de programación' })
  @ApiResponse({ status:200, description:'Objeto que contiene el id', type: Language })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:404, description:'Ocurre cuándo no existe el dato o archivo', type: NotFoundExceptionResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languagesService.findOne(id);
  }

  @Patch(':id')
  @Auth( ValidRoles.admin )
  @ApiParam({ name: 'id', description: 'ID del lenguaje de programación' })
  @ApiResponse({ status:200, description:'Objeto actualizado', type: Language })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:404, description:'Ocurre cuándo no existe el dato o archivo', type: NotFoundExceptionResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateLanguageDto: UpdateLanguageDto) {
    return this.languagesService.update(id, updateLanguageDto);
  }

  @Delete(':id')
  @Auth( ValidRoles.admin )
  @ApiParam({ name: 'id', description: 'ID del lenguaje de programación' })
  @ApiResponse({ status: 200, description: 'Mensaje de confirmación de que el lenguaje ha sido eliminado', content: { 'application/json': { schema: { type: 'object', properties: { message:{ type: 'string',example: 'Lenguaje JavaScript eliminado correctamente', } }, }, },},})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:404, description:'Ocurre cuándo no existe el dato o archivo', type: NotFoundExceptionResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.languagesService.remove(id);
  }
}
