import { Transform } from "class-transformer";
import { IsIn, IsNumber } from "class-validator";

export class CreateDocumentationCodigo {

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    @IsIn([2], {
        message: 'La opción debe ser 2',
    })
    opcArquitectura: number;

}