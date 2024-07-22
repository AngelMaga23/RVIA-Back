import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
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

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

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
      destination: './static/zip',
      filename: fileNamerZip
    })
  }) )
  uploadProductImage( 
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: User
  ){

    if ( !file ) {
      throw new BadRequestException('Make sure that the file is an Zip');
    }

    return this.applicationsService.createFile(file, user);

    // const secureUrl = `${ file.filename }`;
    // const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;

    
  }
}
