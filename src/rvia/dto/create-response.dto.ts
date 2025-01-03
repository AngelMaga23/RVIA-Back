import { ApiProperty } from '@nestjs/swagger';

class OpcArquitecturaDto {
  @ApiProperty({ description: 'Arquitectura opción 1', example: false })
  1: boolean;

  @ApiProperty({ description: 'Arquitectura opción 2', example: false })
  2: boolean;

  @ApiProperty({ description: 'Arquitectura opción 3', example: false })
  3: boolean;

  @ApiProperty({ description: 'Arquitectura opción 4', example: false })
  4: boolean;
}

class ApplicationStatusDto {
  @ApiProperty({ description: 'ID del estatus de la aplicación', example: 2 })
  idu_estatus_aplicacion: number;

  @ApiProperty({ description: 'Descripción del estatus de la aplicación', example: '801fd9ca729ba4aab550f9d7e3e2a1f1:7f8bac24bafc70e6c1dfbf9c49945294' })
  des_estatus_aplicacion: string;
}

class SourceCodeDto {
  @ApiProperty({ description: 'ID del código fuente', example: 30 })
  idu_codigo_fuente: number;

  @ApiProperty({ description: 'Nombre del código fuente', example: 'e295aa7af93e868a52b17b534d9665f2:7d52ca6270058d008a07bc13ee99f68da3c7bc4c3aaf9dcefcd97cfd2ec81765f02cf9216d473c9cebe35fafa71ee55de80d1156c777437324488e11d5e00103' })
  nom_codigo_fuente: string;

  @ApiProperty({ description: 'Nombre del directorio', example: 'faa7c3e92c36ae13c5267f57b9fcac8e:f3fdc7c0314c8f132dad0f64b0374f3cdebe7bcb646b74f708d506705ad53e6d9a7c4a3eca81c9210bde80d106b33efe' })
  nom_directorio: string;
}

class PositionDto {
  @ApiProperty({ description: 'ID del rol', example: 1 })
  idu_rol: number;

  @ApiProperty({ description: 'Nombre del rol', example: '560d8d05cfacc7ea2dae3c177ee41032:5cc44baca89a4f886de66004424365ce' })
  nom_rol: string;
}

class UserDto {
  @ApiProperty({ description: 'ID del usuario', example: 1 })
  idu_usuario: number;

  @ApiProperty({ description: 'Número de empleado', example: 99887766 })
  num_empleado: number;

  @ApiProperty({ description: 'Correo del usuario', example: '1b4eb5ff6797bdc40aa2dbc2747f41a5:47320e3d0245fc78553583df243eeb4b6435f8470b4c67b274e4f7954babb451' })
  nom_correo: string;

  @ApiProperty({ description: 'Nombre de usuario', example: 'c4e2b083b4bbfea7d2cac052020f27b4:3c549fac278db4007e3fe87dcd1bf1e96d317cf15073bd5e6886d3b8410ade58' })
  nom_usuario: string;

  @ApiProperty({ description: 'Indica si el usuario está activo', example: true })
  opc_es_activo: boolean;

  @ApiProperty({ description: 'Rol del usuario' })
  position: PositionDto;
}

export class CreateResponseDto {
  @ApiProperty({ description: 'ID de la aplicación', example: 30 })
  idu_aplicacion: number;

  @ApiProperty({ description: 'ID del proyecto', example: '344202409' })
  idu_proyecto: string;

  @ApiProperty({ description: 'Nombre de la aplicación', example: 'catalogoproductos' })
  nom_aplicacion: string;

  @ApiProperty({ description: 'Número de acción', example: 1 })
  num_accion: number;

  @ApiProperty({ description: 'Opción del lenguaje', example: 0 })
  opc_lenguaje: number;

  @ApiProperty({ description: 'Estatus de la documentación', example: 0 })
  opc_estatus_doc: number;

  @ApiProperty({ description: 'Estatus de la documentación de código', example: 0 })
  opc_estatus_doc_code: number;

  @ApiProperty({ description: 'Estatus de los casos de pruebas', example: 0 })
  opc_estatus_caso: number;

  @ApiProperty({ description: 'Estatus de la calificación del código', example: 0 })
  opc_estatus_calificar: number;

  @ApiProperty({ description: 'Opciones de arquitectura' })
  opc_arquitectura: OpcArquitecturaDto;

  @ApiProperty({ description: 'Estatus de la aplicación' })
  applicationstatus: ApplicationStatusDto;

  @ApiProperty({ description: 'Código fuente' })
  sourcecode: SourceCodeDto;

  @ApiProperty({ description: 'Usuario' })
  user: UserDto;

  @ApiProperty({ description: 'Indica si el proceso del rvia es válido', example: true })
  isProccessValid: boolean;

  @ApiProperty({ description: 'Mensaje del RVIA', example: 'Proceso IA iniciado correctamente' })
  message: string;
}
