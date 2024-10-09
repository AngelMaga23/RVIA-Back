import { ApiProperty } from "@nestjs/swagger";

export class CreateCommonDto {
    @ApiProperty({ example: 204 })
    idu_aplicacion: number;

    @ApiProperty({ example: "266202410" })
    idu_proyecto: string;

    @ApiProperty({ example: "examenes" })
    nom_aplicacion: string;

    @ApiProperty({ example: 2 })
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

    @ApiProperty({ example: { "1": false, "2": false, "3": false, "4": false } })
    opc_arquitectura: { [key: number]: boolean };

    @ApiProperty({
        example: [
            {
                idu_checkmarx: 113,
                nom_checkmarx: "checkmarx_266202410_examenes.csv",
                nom_directorio: "d4cf2403da30c4c075770ac3f67f2e14:2f61ecbc8d79d1a428b3a2f290588c8fbcc6800099cc3b1be75e4087af1b23ba4313a917a061c1e34af396e0db3d88813eb584bc39593bb45ea46474912eccd2308bd925b002ee73bcdaba2f90861b30"
            }
        ]
    })
    checkmarx: Array<{
        idu_checkmarx: number;
        nom_checkmarx: string;
        nom_directorio: string;
    }>;

    @ApiProperty({ example: [] })
    cost: any[];

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
            idu_codigo_fuente: 204,
            nom_codigo_fuente: "9ad61f44-6f4a-49c0-b3e5-6b6b97dfaf25.examenes.zip",
            nom_directorio: "/sysx/bito/projects/266202410_examenes"
        }
    })
    sourcecode: {
        idu_codigo_fuente: number;
        nom_codigo_fuente: string;
        nom_directorio: string;
    };

    @ApiProperty({
        example: {
            idu_usuario: 1,
            numero_empleado: 99806750,
            nom_correo: "e0dd34d83937aa751de783155ca1bf4d:af39db51b0ca96d353b625edb632a15a59a4794170fe8e979a7c88d16f060745",
            nom_usuario: "nombre usuario completo",
            esactivo: true
        }
    })
    user: {
        idu_usuario: number;
        numero_empleado: number;
        nom_correo: string;
        nom_usuario: string;
        esactivo: boolean;
    };

    @ApiProperty({ example: 1 })
    sequentialId: number;

    @ApiProperty({ example: 0 })
    totalCost: number;
}


