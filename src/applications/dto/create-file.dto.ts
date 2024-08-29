import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateFileDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    num_accion: number;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    opc_lenguaje: number = 0;
    
    @IsOptional()
    fec_creacion?: Date;
  
    @IsOptional()
    fec_actualizacion?: Date; 

}
