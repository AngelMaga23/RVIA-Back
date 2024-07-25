import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Get()
  @Auth( ValidRoles.admin )
  findAllActive() {
    return this.authService.findAllActiveUsers();
  }

  // @Get()
  // @Auth( ValidRoles.admin )
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Auth( ValidRoles.admin )
  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto ) {
    return this.authService.login( loginUserDto );
  }

  @Auth( ValidRoles.admin )
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.delete(id);
  }

  @Auth( ValidRoles.admin )
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.authService.update(id,updateUserDto);
  }

  @Get('private')
  @Auth( ValidRoles.admin, ValidRoles.autorizador )
  // @Auth(ValidRoles.autorizador, ValidRoles.admin)

  testingPrivateRoute(  @GetUser() user: User ) {
    return {user  };
  }

}
