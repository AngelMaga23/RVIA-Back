import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, LoginUserResponseDto, UpdateUserDto, UserResponseDto } from './dto';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { BadRequestResponse, ForbiddenResponse, InternalServerErrorResponse, UnauthorizedResponse } from 'src/common/dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Rutas POST
  @Post('register')
  @ApiResponse({ status:201, description:'Se realizó la conexión del RVIA correctamente', type: CreateUserDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  @ApiResponse({ status:201, description:'Se realizó la conexión del RVIA correctamente', type: LoginUserResponseDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  loginUser(@Body() loginUserDto: LoginUserDto) {
    const uuu = this.authService.login(loginUserDto)

    //return this.authService.login(loginUserDto);
    return uuu;
  }

  // Rutas GET más específicas
  @Get('check-status')
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

  @Get(':id')
  @ApiResponse({ status:200, description:'Se obtuvo el usuario', type: UserResponseDto})
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  findById(@Param('id') id: string) {
    return this.authService.findUserById(id);
  }

  // Rutas GET más generales
  @Get()
  @ApiResponse({ status:201, description:'Se obtienen la lista de usuarios', type: [UserResponseDto]})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  findAllActive() {
    return this.authService.findAllActiveUsers();
  }

  // Rutas PATCH
  @Patch(':id')
  @ApiResponse({ status:200, description:'Se modificó el usuario correctamente', type: UserResponseDto})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser() user: User) {
    return this.authService.update(id, updateUserDto, user);
  }

  // Rutas DELETE
  @Delete(':id')
  @ApiResponse({ status:200, description:'Se dopc_es_activo el usuario correctamente', schema:{
    example:{
      idu_usuario: 1,
      num_empleado: 99887767,
      nom_correo: "78931e7cd4d73df54a0fb9acfb54cb7a:dc87cb86d5340d6cb62e0848ead702bb7a870ce9b0ac30492558c1c4775cfc80",
      nom_usuario: "9de664d7eab871d923bf6ce9f1f629a2:34b31f4db11866954db5adb63c8a819f0ee1ba056288035afe994c599a9f5079",
      opc_es_activo: false,
      position: {
        idu_rol: 2,
        nom_rol: "5ab4703fc4b825f24ea82846be79afc0:60ab1450601d55d1f02a7d56bd826f76"
      }
    }
  }})
  @ApiResponse({ status:400, description:'Bad Request', type: BadRequestResponse })
  @ApiResponse({ status:401, description:'Unauthorized', type: UnauthorizedResponse })
  @ApiResponse({ status:403, description:'Forbidden', type: ForbiddenResponse })
  @ApiResponse({ status:500, description:'Internal server error', type: InternalServerErrorResponse })
  @Auth(ValidRoles.admin)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.authService.delete(id, user);
  }
}
