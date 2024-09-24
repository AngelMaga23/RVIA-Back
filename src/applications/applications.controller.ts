import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';
import { fileFilterZip, fileNamerZip } from './helper/ZIP';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Auth } from 'src/auth/decorators';
import { CreateApplicationDto, CreateFileDto } from './dto';

import { ValidationInterceptor } from '../interceptors/validation-file/validation-file.interceptor';
import { ValidRoles } from 'src/auth/interfaces';
import { CreateArchitecture } from './dto/create-architecture.dto';
import { CreateDocumentation } from './dto/create-documentation.dto';
import { CreateTestCases } from './dto/create-testcases.dto';
import { CreateRateProject } from './dto/create-rateproject.dto';
import { CreateDocumentationCodigo } from './dto/create-documentation-cod.dto';


@ApiTags('Aplicaciones')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  findAll(@GetUser() user: User) {
    return this.applicationsService.findAll(user);
  }

  @Post('git')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const dir = `/sysx/bito/projects`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
  new ValidationInterceptor((dto: CreateApplicationDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  })
  )
  create(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitFile(createApplicationDto, user, file);
  }

  @Post('gitlab')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const dir = `/sysx/bito/projects`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }),
  new ValidationInterceptor((dto: CreateApplicationDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  }))
  createGitLab(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitLabFile(createApplicationDto, user, file);
  }

  @Post('files')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  @UseInterceptors(FilesInterceptor('files', 2, {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const dir = `/sysx/bito/projects`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    }),

  }),
  new ValidationInterceptor((dto: CreateFileDto) => {
    // Implement DTO validation logic here
    return true; // Replace with actual validation
  })
  )
  uploadFileZip(
    @Body() createFileDto: CreateFileDto,
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User
  ) {

    if (files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const zipOr7zFile = files.find(file => 
      file.mimetype.includes('zip') || file.mimetype.includes('x-7z-compressed') || file.mimetype.includes('x-zip-compressed')
    );
    const pdfFile = files.find(file => file.mimetype.includes('pdf'));  

    if ( !zipOr7zFile ) {
      throw new BadRequestException('You must upload one ZIP file and one PDF file');
    }

    return this.applicationsService.createFiles(createFileDto, zipOr7zFile, pdfFile, user);

  }

  @Patch(':id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador)
  update(@Param('id', ParseIntPipe) id: number, @Body('estatusId') estatusId: number) {
    return this.applicationsService.update(id, estatusId);
  }

  @Patch('documentation/:id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  addAppDocumentation(@Param('id', ParseIntPipe) id: number, @Body() createDocumentation: CreateDocumentation) {
    return this.applicationsService.addAppDocumentation(id, createDocumentation);
  }

  @Patch('documentation-code/:id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  addAppDocumentationCode(@Param('id', ParseIntPipe) id: number, @Body() createDocumentationCodigo: CreateDocumentationCodigo) {
    return this.applicationsService.addAppDocumentationCode(id, createDocumentationCodigo);
  }

  @Patch('test-cases/:id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  addApptestCases(@Param('id', ParseIntPipe) id: number, @Body() createTestCases: CreateTestCases) {
    return this.applicationsService.addAppTestCases(id, createTestCases);
  }

  @Patch('rate-project/:id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  addAppRateProject(@Param('id', ParseIntPipe) id: number, @Body() createRateProject: CreateRateProject) {
    return this.applicationsService.addAppRateProject(id, createRateProject);
  }


  @Get('zip/:id')
  @Auth(ValidRoles.admin, ValidRoles.autorizador, ValidRoles.user)
  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {

    await this.applicationsService.getStaticFile7z(id, res);

  }

}
