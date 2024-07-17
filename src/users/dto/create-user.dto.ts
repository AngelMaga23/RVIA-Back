import { IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsString()
    @MinLength(1)
    name: string;

    @IsNumber()
    @MinLength(1)
    employee_number: string;

    @IsString()
    @MinLength(1)
    @IsEmail()
    email: string;

}
