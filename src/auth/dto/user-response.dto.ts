import { ApiProperty } from "@nestjs/swagger";

class PositionDto {
    @ApiProperty({ description: 'ID del rol', example: 1 })
    idu_rol: number;
  
    @ApiProperty({ description: 'Nombre del rol', example: '560d8d05cfacc7ea2dae3c177ee41032:5cc44baca89a4f886de66004424365ce' })
    nom_rol: string;
  }

export class UserResponseDto {

    @ApiProperty({ description: 'Id del empleado', example: 99887770 })
    idu_usuario: number;

    @ApiProperty({ description: 'Número de empleado', example: 99887770 })
    num_empleado: string;

    @ApiProperty({ description: 'Correo Registrado', example: "correo@coppel.com" })
    nom_correo: string;

    @ApiProperty({ description: 'Nombre del Usuario', example: "Jose Arturo Solis Ramirez" })
    nom_usuario: string;

    @ApiProperty({ description: 'Estatus del usuario', example: true })
    opc_es_activo: boolean;

    @ApiProperty({ description: 'Opciones de arquitectura' })
    position: PositionDto;
    
}