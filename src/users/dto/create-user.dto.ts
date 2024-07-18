import { Transform } from "class-transformer";
import { IsEmail, IsNumber, IsString, Length, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @Length(8, 8)
    employee_number: string;

    @IsString()
    @MinLength(1)
    @IsEmail()
    email: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    positionId: number;

}
