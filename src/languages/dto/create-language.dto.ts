import { IsString, MinLength } from "class-validator";

export class CreateLanguageDto {
    @IsString()
    @MinLength(1)
    nom_lenguaje: string;
}
