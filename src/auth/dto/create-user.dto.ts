import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';


export class CreateUserDto {

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    password: string;

    @IsString()
    @MinLength(1)
    name: string;

    @IsString()
    @Length(8, 8)
    employee_number: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    positionId: number;

}
