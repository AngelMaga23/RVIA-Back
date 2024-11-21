import { ApiProperty } from '@nestjs/swagger';

export class ApplicationDto {
    @ApiProperty({ example: "FrontTest" })
    nom_aplicacion: string;

    @ApiProperty({ example: 162202410 })
    idu_proyecto: number;

    @ApiProperty({ example: 1 })
    num_accion: number;

    @ApiProperty({ example: { "1": true, "2": true, "3": true, "4": true } })
    opc_arquitectura: { [key: number]: boolean };

    @ApiProperty({ example: 0 })
    opc_lenguaje: number;

    @ApiProperty({ example: 2 })
    opc_estatus_doc: number;

    @ApiProperty({ example: 2 })
    opc_estatus_doc_code: number;

    @ApiProperty({ example: 2 })
    opc_estatus_caso: number;

    @ApiProperty({ example: 2 })
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
            nom_codigo_fuente: "5060da17c307fad2899b32e0b9a86308:fa6087f597c5a939ed138ad471927b79",
            nom_directorio: "257387a018ad00ad043de723597e04ff:f3d15b730fa31c7c64cbb5bf38668cd77c292ccb141f5a0be28708067c92c96d387f44ac75e3a8a8e26dada2c8eacc46",
            idu_codigo_fuente: 163
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

    @ApiProperty({ example: 159 })
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

export class CreateGitDto {
    @ApiProperty({ type: ApplicationDto })
    application: ApplicationDto;

    @ApiProperty({ type: CheckmarxDto })
    checkmarx: CheckmarxDto;

    @ApiProperty({ example: false })
    esSanitizacion: boolean;

    @ApiProperty({ type: RviaProcessDto })
    rviaProcess: RviaProcessDto;
}