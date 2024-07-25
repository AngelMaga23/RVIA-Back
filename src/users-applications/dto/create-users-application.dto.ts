import { Type } from "class-transformer";
import { IsNumber, Min, MinLength } from "class-validator";

export class CreateUsersApplicationDto {

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    idu_aplicacion: string;

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    idu_usuario: string;

}
