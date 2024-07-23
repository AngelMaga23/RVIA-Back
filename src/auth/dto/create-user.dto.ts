import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';


export class CreateUserDto {

    @IsString()
    @IsEmail()
    nom_correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'The password must have a Uppercase, lowercase letter and a number'
    })
    nom_contrasena: string;

    @IsString()
    @MinLength(1)
    nom_usuario: string;

    @IsString()
    @Length(8, 8)
    numero_empleado: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    idu_puesto: number;

}
