import { ApiProperty } from '@nestjs/swagger';

export class ApplicationDto {
    @ApiProperty({ example: "RVIA-Front" })
    nom_aplicacion: string;

    @ApiProperty({ example: 968202410 })
    idu_proyecto: number;

    @ApiProperty({ example: 1 })
    num_accion: number;

    @ApiProperty({ example: { "1": true, "2": true, "3": true } })
    opc_arquitectura: { [key: number]: boolean };

    @ApiProperty({ example: 0 })
    opc_lenguaje: number;

    @ApiProperty({ example: 2 })
    opc_estatus_doc: number;

    @ApiProperty({ example: 2 })
    opc_estatus_doc_code: number;

    @ApiProperty({ example: 2 })
    opc_estatus_caso: number;

    @ApiProperty({ example: 0 })
    opc_estatus_calificar: number;

    @ApiProperty({
        example: {
            idu_estatus_aplicacion: 2,
            des_estatus_aplicacion: "En espera"
        }
    })
    applicationstatus: {
        idu_estatus_aplicacion: number;
        des_estatus_aplicacion: string;
    };

    @ApiProperty({
        example: {
            nom_codigo_fuente: "fca623eea060b42b5ecf86c6857e986b:ccd38f3ce1ce66cbb1dcfc8592b8001dbb9421a44d76ad8f0d93ecf57c37d08fb8501d2609dfa58b38eb7eb9f611723838b4eb70c62de8aaa732d98dfe869b04",
            nom_directorio: "9ddf084b029365cf1a02efa31284918d:05fec69d16b1798d7b2bb2f209983c1ced4e64c55ff58017e00bfa413c8c58eca5eb7096ad50b180674a89138e0157bd",
            idu_codigo_fuente: 157
        }
    })
    sourcecode: {
        nom_codigo_fuente: string;
        nom_directorio: string;
        idu_codigo_fuente: number;
    };

    @ApiProperty({
        example: {
            idu_usuario: 1,
            numero_empleado: 99887766,
            nom_correo: "example@coppel.com",
            nom_usuario: "nombre usuario completo",
            esactivo: true,
            position: {
                idu_rol: 1,
                nom_rol: "Administrador"
            }
        }
    })
    user: {
        idu_usuario: number;
        numero_empleado: number;
        nom_correo: string;
        nom_usuario: string;
        esactivo: boolean;
        position: {
            idu_rol: number;
            nom_rol: string;
        }
    };

    @ApiProperty({ example: 157 })
    idu_aplicacion: number;
}

export class CheckmarxDto {
    @ApiProperty({ example: [] })
    checkmarx: any[];
}

export class RviaProcessDto {
    @ApiProperty({ example: true })
    isValidProcess: boolean;

    @ApiProperty({ example: "Proceso IA Iniciado Correctamente" })
    messageRVIA: string;
}

export class CreateFilesDto {
    @ApiProperty({ type: ApplicationDto })
    application: ApplicationDto;

    @ApiProperty({ type: CheckmarxDto })
    checkmarx: CheckmarxDto;

    @ApiProperty({ example: false })
    esSanitizacion: boolean;

    @ApiProperty({ type: RviaProcessDto })
    rviaProcess: RviaProcessDto;
}