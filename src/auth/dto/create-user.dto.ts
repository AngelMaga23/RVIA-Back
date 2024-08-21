import { Transform } from 'class-transformer';
import { IsEmail, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength, Validate, ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

// Validador personalizado para el rango específico
@ValidatorConstraint({ name: 'isInRange', async: false })
class IsInRange implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    return value >= 90000000 && value < 100000000;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Value must be between 90,000,000 and 100,000,000';
  }
}

// Validador personalizado para la longitud del número
@ValidatorConstraint({ name: 'isExactLength', async: false })
class IsExactLength implements ValidatorConstraintInterface {
  validate(value: number, args: ValidationArguments): boolean {
    return value.toString().length === 8;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'Number must be exactly 8 digits long';
  }
}

export class CreateUserDto {

    @IsString()
    @IsEmail()
    @Matches(/^[^\s@]+@coppel\.com$/, { message: 'El correo debe ser del dominio @coppel.com.' })
    nom_correo: string;

    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'La contraseña debe tener una letra mayúscula, una minúscula y un número.'
    })
    nom_contrasena: string;

    @IsString()
    @MinLength(1)
    nom_usuario: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10), { toClassOnly: true })
    @Validate(IsExactLength)
    @Validate(IsInRange)
    numero_empleado: string;

    @IsNumber()
    @Transform(({ value }) => parseInt(value, 10))
    idu_rol: number;

    @IsOptional()
    fec_creacion?: Date;
  
    @IsOptional()
    fec_actualizacion?: Date; 

}
