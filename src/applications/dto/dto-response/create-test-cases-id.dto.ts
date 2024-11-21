import { ApiProperty } from '@nestjs/swagger';

export class ApplicationStatusDto {
    @ApiProperty({ example: 1 })
    idu_estatus_aplicacion: number;

    @ApiProperty({ example: "En proceso" })
    des_estatus_aplicacion: string;
}

export class PositionDto {
    @ApiProperty({ example: 1 })
    idu_rol: number;

    @ApiProperty({ example: "560d8d05cfacc7ea2dae3c177ee41032:5cc44baca89a4f886de66004424365ce" })
    nom_rol: string;
}

export class UserDto {
    @ApiProperty({ example: 1 })
    idu_usuario: number;

    @ApiProperty({ example: 99806750 })
    numero_empleado: number;

    @ApiProperty({ example: "e0dd34d83937aa751de783155ca1bf4d:af39db51b0ca96d353b625edb632a15a59a4794170fe8e979a7c88d16f060745" })
    nom_correo: string;

    @ApiProperty({ example: "22671f1e796ac3cf89e1f39c0c16567c:6320621716baf39e59903a944a27bbe39e8df11c7d8a3f0abc68ab41c6a6ecdb" })
    nom_usuario: string;

    @ApiProperty({ example: true })
    esactivo: boolean;

    @ApiProperty({ type: PositionDto })
    position: PositionDto;
}

export class SourceCodeDto {
    @ApiProperty({ example: 205 })
    idu_codigo_fuente: number;

    @ApiProperty({ example: "096e06a0e2b5ff76df85c29096f5c11d:c84cf07d33dd5144fb714a19ed83cd71ba84b58587866a7428ec1634dab15a665d374d9af08c2caf478f3108e334216209970a6b159647ff3e8fa0c61ee939e2" })
    nom_codigo_fuente: string;

    @ApiProperty({ example: "b52ab59fb7b626857642ff64e6dfe56b:db07d9eca4bf0291aca972fc6150e38b8bcd866355e210db40369fb0af2789bd3b96d62902ded9b4b6844509a2832416" })
    nom_directorio: string;
}

export class CreateTestCasesIdDto {
    @ApiProperty({ example: 205 })
    idu_aplicacion: number;

    @ApiProperty({ example: "277202414" })
    idu_proyecto: string;

    @ApiProperty({ example: "examenes" })
    nom_aplicacion: string;

    @ApiProperty({ example: 0 })
    num_accion: number;

    @ApiProperty({ example: 0 })
    opc_lenguaje: number;

    @ApiProperty({ example: 0 })
    opc_estatus_doc: number;

    @ApiProperty({ example: 0 })
    opc_estatus_doc_code: number;

    @ApiProperty({ example: 0 })
    opc_estatus_caso: number;

    @ApiProperty({ example: 0 })
    opc_estatus_calificar: number;

    @ApiProperty({ example: { "1": false, "2": false, "3": true, "4": false } })
    opc_arquitectura: { [key: number]: boolean };

    @ApiProperty({ type: ApplicationStatusDto })
    applicationstatus: ApplicationStatusDto;

    @ApiProperty({ type: UserDto })
    user: UserDto;

    @ApiProperty({ type: SourceCodeDto })
    sourcecode: SourceCodeDto;
}