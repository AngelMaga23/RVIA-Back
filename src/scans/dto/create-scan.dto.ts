import { IsString, MinLength } from "class-validator";

export class CreateScanDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @MinLength(1)
    directory: string;


}
