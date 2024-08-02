import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, HttpException, HttpStatus, UploadedFiles } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileFilterZip, fileNamerZip } from './helper/ZIP';
import { diskStorage } from 'multer';
import { DeepPartial } from 'typeorm';
import { Application } from './entities/application.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../auth/entities/user.entity';
import { Auth } from 'src/auth/decorators';
import { basename } from 'path';

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

        const folderName = file.originalname.split('.')[0];
        //const dir = `./static/zip/${folderName}`; // windows
        const dir = `/tmp/bito`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }))
  create(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.applicationsService.createGitFile(createApplicationDto, user, file);
    // return user;
  }

  @Post('files')
  @Auth()
  @UseInterceptors(FilesInterceptor('files', 2, {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const folderName = file.originalname.split('.')[0];
        //const dir = `./static/zip/${folderName}`; // windows
        const dir = `/tmp/bito`;

        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }))
  uploadFileZip(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: User
  ) {

    if (files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const zipFile = files.find(file => file.mimetype.includes('zip'));
    const pdfFile = files.find(file => file.mimetype.includes('pdf'));  

    if ( !zipFile ) {
      throw new BadRequestException('You must upload one ZIP file and one PDF file');
    }

    return this.applicationsService.createFiles(zipFile, pdfFile, user);

  }

  @Patch(':id')
  @Auth()
  update(@Param('id', ParseIntPipe) id: number, @Body('estatusId') estatusId: number) {
    return this.applicationsService.update(id, estatusId);
  }

  // @Auth()
  @Get('zip/:id')
  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {

    // const path = await this.applicationsService.getStaticFileZip( id, res );

    // const fileName = basename(path); 
    await this.applicationsService.getStaticFileZip(id, res);
    // res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    // res.sendFile(path, (err) => {
    //   if (err) {
    //     throw new HttpException('Error sending file', HttpStatus.INTERNAL_SERVER_ERROR);
    //   }
    // });

    // res.sendFile( path );
    // return path;
  }

}
