import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSubjectDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre de la asignatura es obligatorio' })
    name!: string;

    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsOptional()
    description?: string;
}