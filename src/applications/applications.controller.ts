import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { ApplicationsService } from './applications.service';
import { fileFilterZip, fileNamerZip } from './helper/ZIP';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Auth } from 'src/auth/decorators';
import { CreateApplicationDto, CreateFileDto } from './dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) { }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.applicationsService.findAll(user);
  }

  @Post('git')
  @Auth()
  @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const dir = `/tmp/bito`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }))
  create(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitFile(createApplicationDto, user, file);
  }

  @Post('files')
  @Auth()
  @UseInterceptors(FilesInterceptor('files', 2, {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const dir = `/tmp/bito`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }))
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

    if (!zipOr7zFile) {
      throw new BadRequestException('You must upload one ZIP file and one PDF file');
    }

    return this.applicationsService.createFiles(createFileDto, zipOr7zFile, pdfFile, user);

  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseIntPipe) id: number, @Body('estatusId') estatusId: number) {
    return this.applicationsService.update(id, estatusId);
  }

  @Auth()
  @Get('zip/:id')
  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {

    await this.applicationsService.getStaticFileZip(id, res);

  }

}
