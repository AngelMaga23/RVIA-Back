import { Controller, Body, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { CreateDocumentation } from './dto/create-documentation.dto';
import { CreateDocumentationCodigo } from './dto/create-documentation-cod.dto';
import { BadRequestResponse, UnauthorizedResponse, ForbiddenResponse, InternalServerErrorResponse, CreateDocumentationIdDto, CreateDocumentationCodeIdDto } from './dto/dto-response'

@ApiTags('Aplicaciones')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Patch('documentation/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para añadir documentación', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateDocumentationIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  addAppDocumentation(@Param('id', ParseIntPipe) id: number, @Body() createDocumentation: CreateDocumentation) {
    return this.applicationsService.addAppDocumentation(id, createDocumentation);
  }
  
  @Patch('documentation-code/:id')
  @ApiParam({ name: 'id', description: 'ID de la aplicación para añadir documentación de código', type: Number })
  @ApiResponse({ status:201, description:'Se muestra correctamente', type: CreateDocumentationCodeIdDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  addAppDocumentationCode(@Param('id', ParseIntPipe) id: number, @Body() createDocumentationCodigo: CreateDocumentationCodigo) {
    return this.applicationsService.addAppDocumentationCode(id, createDocumentationCodigo);
  }
}
