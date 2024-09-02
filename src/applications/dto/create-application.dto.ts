import { Transform } from "class-transformer";
import { IsIn, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateApplicationDto {

    @IsString()
    @MinLength(1)
    url: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([0,1, 2, 3], {
        message: 'El valor de num_accion debe ser 0, 1, 2 o 3',
    })
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
