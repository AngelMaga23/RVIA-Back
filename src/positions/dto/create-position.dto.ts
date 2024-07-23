import { IsString, MinLength } from "class-validator";

export class CreatePositionDto {

    @IsString()
    @MinLength(1)
    nom_puesto: string;


}
