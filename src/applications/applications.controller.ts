import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, ParseIntPipe, Res, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import { Response } from 'express';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.applicationsService.findAll(user);
  }

  @Post('git')
  @Auth()
  create(@Body() createApplicationDto: CreateApplicationDto, @GetUser() user: User) {
    return this.applicationsService.createGitFile(createApplicationDto, user);
    // return user;
  }

  @Post('files')
  @Auth()
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilterZip,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: (req, file, cb) => {

        const folderName = file.originalname.split('.')[0];
        const dir = `./static/zip/${folderName}`; // windows
        // const dir = `/tmp/${folderName}`; linux
        
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: fileNamerZip
    })
  }) )
  uploadFileZip( 
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User
  ){

    if ( !file ) {
      throw new BadRequestException('Make sure that the file is an Zip');
    }

    return this.applicationsService.createFile(file, user);
    
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body('estatusId') estatusId: number) {
    return this.applicationsService.update(id, estatusId);
  }

  @Auth()
  @Get('zip/:id')
  async findFileZip(
    @Res() res: Response,
    @Param('id') id: number
  ) {

    const path = await this.applicationsService.getStaticFileZip( id );

    const fileName = basename(path); 

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(path, (err) => {
      if (err) {
        throw new HttpException('Error sending file', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    // res.sendFile( path );
    // return path;
  }

}
