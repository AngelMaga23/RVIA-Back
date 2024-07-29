import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

// Rutas POST
@Post('register')
createUser(@Body() createUserDto: CreateUserDto) {
  return this.authService.create(createUserDto);
}

@Post('login')
loginUser(@Body() loginUserDto: LoginUserDto) {
  return this.authService.login(loginUserDto);
}

// Rutas GET más específicas
@Get('check-status')
@Auth()
checkAuthStatus(@GetUser() user: User) {
  return this.authService.checkAuthStatus(user);
}

@Get('private')
@Auth(ValidRoles.admin, ValidRoles.autorizador)
testingPrivateRoute(@GetUser() user: User) {
  return { user };
}

@Get(':id')
@Auth(ValidRoles.admin)
findById(@Param('id') id: string) {
  return this.authService.findUserById(id);
}

// Rutas GET más generales
@Get()
@Auth(ValidRoles.admin)
findAllActive() {
  return this.authService.findAllActiveUsers();
}

// @Get()
// @Auth(ValidRoles.admin)
// findAll() {
//   return this.authService.findAll();
// }

// Rutas PATCH
@Patch(':id')
@Auth(ValidRoles.admin)
update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  return this.authService.update(id, updateUserDto);
}

// Rutas DELETE
@Delete(':id')
@Auth(ValidRoles.admin)
remove(@Param('id') id: string) {
  return this.authService.delete(id);
}
}
