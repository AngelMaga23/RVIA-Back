import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';


export class LoginUserDto {

    @IsString()
    @Length(8, 8)
    employee_number: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    password: string;

}