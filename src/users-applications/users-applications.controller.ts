import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { UsersApplicationsService } from './users-applications.service';
import { CreateUsersApplicationDto } from './dto/create-users-application.dto';
import { UpdateUsersApplicationDto } from './dto/update-users-application.dto';
import { ApplicationsService } from 'src/applications/applications.service';
import { Auth } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('users-applications')
@Auth( ValidRoles.admin )
export class UsersApplicationsController {
  constructor(
    private readonly usersApplicationsService: UsersApplicationsService,
  ) {}

  @Post()
  create(@Body() createUsersApplicationDto: CreateUsersApplicationDto) {
    return this.usersApplicationsService.create(createUsersApplicationDto);
  }

  @Get()
  findAll() {
    return this.usersApplicationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersApplicationsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersApplicationsService.remove(id);
  }
}
