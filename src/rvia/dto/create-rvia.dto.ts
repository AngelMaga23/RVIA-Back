import { Transform } from "class-transformer";
import { IsNumber } from "class-validator";

export class CreateRviaDto {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    idu_aplicacion: number;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    conIA: number;

}
