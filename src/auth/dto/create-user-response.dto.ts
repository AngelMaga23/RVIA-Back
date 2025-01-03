import { ApiProperty } from "@nestjs/swagger";

class position {
    @ApiProperty({ description: 'ID del rol', example: 1 })
    idu_rol: number;
  
    @ApiProperty({ description: 'Nombre del Rol', example: "Administrador" })
    nom_rol: string;
}


export class CreateUserResponseDto {

    @ApiProperty({ description: 'Número de empleado', example: 99887770 })
    num_empleado: string;

    @ApiProperty({ description: 'Correo Registrado', example: "correo@coppel.com" })
    nom_correo: string;

    @ApiProperty({ description: 'Opciones de arquitectura' })
    position: position;

    @ApiProperty({ description: 'ID del Usuario', example: 1 })
    idu_usuario: number;

    @ApiProperty({ description: 'Estatus del usuario', example: true })
    opc_es_activo: boolean;

    @ApiProperty({ description: 'Token generado', example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwiaWF0IjoxNzI3MTE4MjQ0LCJleHAiOjE3MjcxMjU0NDR9.pRMxxGubMpJZgK3b-T8h5yb7DBcyLGr7EywYzwI9Rjc" })
    token: string;
    
}