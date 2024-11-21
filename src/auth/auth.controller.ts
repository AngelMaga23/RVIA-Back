import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, LoginUserResponseDto, UpdateUserDto, UserResponseDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, UnauthorizedResponse } from 'src/common/dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Rutas POST

  @ApiResponse({ status:201, description:'Se realizó la conexión del RVIA correctamente', type: CreateUserDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }


  @ApiResponse({ status:201, description:'Se realizó la conexión del RVIA correctamente', type: LoginUserResponseDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  // Rutas GET más específicas

  @ApiResponse({ status:200, description:'Se realizó la conexión del RVIA correctamente', type: LoginUserResponseDto})
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  // @Get('private')
  // @Auth(ValidRoles.admin, ValidRoles.autorizador)
  // testingPrivateRoute(@GetUser() user: User) {
  //   return { user };
  // }


  @ApiResponse({ status:200, description:'Se obtuvo el usuario', type: UserResponseDto})
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  findById(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }

  // Rutas GET más generales

  @ApiResponse({ status:201, description:'Se obtienen la lista de usuarios', type: [UserResponseDto]})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  findAllActive() {
    return this.authService.findAllActiveUsers();
  }
}
