import { ApiProperty } from "@nestjs/swagger";

class PositionDto {
    @ApiProperty({ description: 'ID del rol', example: 1 })
    idu_rol: number;
  
    @ApiProperty({ description: 'Nombre del rol', example: '560d8d05cfacc7ea2dae3c177ee41032:5cc44baca89a4f886de66004424365ce' })
    nom_rol: string;
  }

export class LoginUserResponseDto {

    @ApiProperty({ description: 'Id del empleado', example: 99887770 })
    idu_usuario: number;

    @ApiProperty({ description: 'Número de empleado', example: 99887770 })
    num_empleado: string;

    @ApiProperty({ description: 'Correo Registrado', example: "correo@coppel.com" })
    nom_correo: string;

    @ApiProperty({ description: 'Nombre del Usuario', example: "Jose Arturo Solis Ramirez" })
    nom_usuario: string;

    @ApiProperty({ description: 'Opciones de arquitectura' })
    position: PositionDto;

    @ApiProperty({ description: 'Token generado', example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzI3MTE4MjQ0LCJleHAiOjE3MjcxMjU0NDR9.pRMxxGubMpJZgK3b-T8h5yb7DBcyLGr7EywYzwI9Rjc" })
    token: string;
    
}