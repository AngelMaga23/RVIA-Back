import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateApplicationDto {

    @IsString()
    @MinLength(1)
    url: string;
    
    @IsOptional()
    fechaCreacion?: Date;
  
    @IsOptional()
    fechaActualizacion?: Date; 

}
