import { IsString, MinLength } from "class-validator";

export class CreateApplicationstatusDto {

    @IsString()
    @MinLength(1)
    description: string;

}
