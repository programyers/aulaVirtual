import { IsEmail, IsEnum, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email!: string;

    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#_-])[A-Za-z\d@$!%*?&.#_-]{8,}$/,
        {
            message:
                'La contraseña debe incluir al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&.#_-)',
        }
    )
    password!: string;

    @IsString()
    @IsNotEmpty({ message: 'El nombre completo es requerido' })
    fullName!: string;

    @IsEnum(['ADMIN', 'TEACHER', 'STUDENT'], { message: 'Rol no válido' })
    @IsNotEmpty({ message: 'El rol es requerido' })
    role!: 'ADMIN' | 'TEACHER' | 'STUDENT';
}