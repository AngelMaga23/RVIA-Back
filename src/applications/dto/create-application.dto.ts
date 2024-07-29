import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateApplicationDto {

    @IsString()
    @MinLength(1)
    url: string;
    
    @IsOptional()
    fec_creacion?: Date;
  
    @IsOptional()
    fec_actualizacion?: Date; 

}
