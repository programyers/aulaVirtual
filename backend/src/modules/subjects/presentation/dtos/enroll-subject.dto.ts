import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollSubjectDto {
    @IsString({ message: 'El código debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El código de la asignatura es obligatorio' })
    code!: string;
}