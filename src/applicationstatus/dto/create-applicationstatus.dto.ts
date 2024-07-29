import { IsOptional, IsString, MinLength } from "class-validator";

export class CreateApplicationstatusDto {

    @IsString()
    @MinLength(1)
    des_estatus_aplicacion: string;

    @IsOptional()
    fechaCreacion?: Date;
  
    @IsOptional()
    fechaActualizacion?: Date; 
}
