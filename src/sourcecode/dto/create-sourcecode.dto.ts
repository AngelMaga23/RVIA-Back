import { IsString, MinLength } from "class-validator";

export class CreateSourcecodeDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @MinLength(1)
    directory: string;

}
