import { IsOptional, IsString, MinLength } from "class-validator";

export class CreatePositionDto {

    @IsString()
    @MinLength(1)
    nom_puesto: string;

    @IsOptional()
    fechaCreacion?: Date;
  
    @IsOptional()
    fechaActualizacion?: Date; 
}
