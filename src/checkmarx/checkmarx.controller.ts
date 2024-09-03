import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import * as fs from 'fs';
import { diskStorage } from 'multer';


import { CheckmarxService } from './checkmarx.service';
import { CreateCheckmarxDto } from './dto/create-checkmarx.dto';
import { UpdateCheckmarxDto } from './dto/update-checkmarx.dto';

import { fileFilter, fileNamer } from './helper';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { Response } from 'express';
import { fileFilterPDF } from './helper/fileFilterpdf';
import { ValidationInterceptor } from '../interceptors/validation-file/validation-file.interceptor';
import { UnauthorizedResponse } from 'src/common/dto/unauthorized-response.dto';
import { ForbiddenResponse } from 'src/common/dto/forbidden-response.dto';
import { BadRequestResponse } from 'src/common/dto/bad-request-response.dto';
import { InternalServerErrorResponse } from 'src/common/dto/server-error.dto';
import { Checkmarx } from './entities/checkmarx.entity';


@ApiTags('Checkmarx')
@Controller('checkmarx')
export class CheckmarxController {
  constructor(private readonly checkmarxService: CheckmarxService) {}

  @Post()
  @Auth(ValidRoles.admin, ValidRoles.autorizador)
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status:201, description:'CSV se subió correctamente', type: Checkmarx })
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      if (file.mimetype === 'text/csv' && ext === 'csv') {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'), false);
      }
    },
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamer
    })
  }),
  new ValidationInterceptor((dto: CreateCheckmarxDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  }))
  async create(@Body() createCheckmarxDto: CreateCheckmarxDto, @UploadedFile() file: Express.Multer.File) {

    if ( !file ) {
      throw new BadRequestException('Debes cargar un archivo Csv');
    }

    return this.checkmarxService.create(createCheckmarxDto, file);
  }

  @Post('recoverypdf')
  @Auth(ValidRoles.admin)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterPDF,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamer
    })
  }),
  new ValidationInterceptor((dto: CreateCheckmarxDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  }))
  async uploadPDF(@Body() createCheckmarxDto: CreateCheckmarxDto, @UploadedFile() file: Express.Multer.File) {

    if ( !file ) {
      throw new BadRequestException('Debes cargar un archivo PDF');
    }

    return this.checkmarxService.convertPDF(createCheckmarxDto, file);
  }

  @Post('upload-pdf')
  @Auth(ValidRoles.autorizador, ValidRoles.admin)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterPDF,
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dir = `/sysx/bito/projects`;
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamer
    })
  }),
  new ValidationInterceptor((dto: CreateCheckmarxDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  }))
  async uploadPDFList(@Body() createCheckmarxDto: CreateCheckmarxDto, @UploadedFile() file: Express.Multer.File) {

    if ( !file ) {
      throw new BadRequestException('Debes cargar un archivo PDF');
    }

    return this.checkmarxService.convertPDF(createCheckmarxDto, file);
  }

  
  @Get()
  findAll() {
    return this.checkmarxService.findAll();
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: number) {
    return this.checkmarxService.findOneByApplication(id);
  }

  @Get('download/:id')
  downloadCsv(@Param('id') id: number, @Res() res: Response) {
    return this.checkmarxService.downloadCsvFile(id,res);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkmarxService.remove(+id);
  }
}
