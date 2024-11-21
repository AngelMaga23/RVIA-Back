import { Transform } from "class-transformer";
import { IsIn, IsNumber } from "class-validator";

export class CreateRateProject {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([4], {
        message: 'La opción debe ser 4',
    })
    opcArquitectura: number;

}