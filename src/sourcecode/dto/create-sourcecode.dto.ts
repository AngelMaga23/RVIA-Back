import { IsString, MinLength } from "class-validator";

export class CreateSourcecodeDto {

    @IsString()
    @MinLength(1)
    nom_codigo_fuente: string;

    @IsString()
    @MinLength(1)
    nom_directorio: string;

}
