import { Transform } from "class-transformer";
import { IsIn, IsNumber } from "class-validator";

export class CreateArchitecture {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([1, 2, 3], {
        message: 'La opción debe ser 1, 2 o 3',
    })
    opcArquitectura: number;

}