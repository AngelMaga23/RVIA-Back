import { Transform } from "class-transformer";
import { ArrayMinSize, ArrayNotEmpty, IsArray, IsIn, IsJSON, IsNumber, IsObject, IsOptional, IsString, MinLength } from "class-validator";

export class CreateApplicationDto {

    @IsString()
    @MinLength(1)
    url: string;

    @IsArray()
    @ArrayNotEmpty({ message: 'El arreglo de acciones no puede estar vacío' })
    @ArrayMinSize(1, { message: 'Debe haber al menos una acción' })
    @Transform(({ value }) => value.map((accion: string) => parseInt(accion, 10)))
    @IsNumber({}, { each: true, message: 'Cada acción debe ser un número' })
    @IsIn([1, 2, 3, 4, 5, 6, 7, 8], {
        each: true,
        message: 'Cada valor en acciones debe ser 1, 2, 3, 4, 5, 6, 7 u 8',
    })
    acciones: number[];

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => parseInt(value, 10))
    opc_lenguaje: number = 0;

    // @IsOptional()
    // @Transform(({ value }) => {
    //     try {
    //       return typeof value === 'string' ? JSON.parse(value) : value;
    //     } catch {
    //       throw new Error('opc_arquitectura debe ser una cadena JSON válida');
    //     }
    //   })
    //   @IsObject({ message: 'opc_arquitectura debe ser un objeto' })
    // opc_arquitectura:Record<string, boolean>;
    
    @IsOptional()
    fec_creacion?: Date;
  
    @IsOptional()
    fec_actualizacion?: Date; 

}
