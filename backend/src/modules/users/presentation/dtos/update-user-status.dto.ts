import { IsEnum, IsNotEmpty } from 'class-validator';

export enum UserStatusEnum {
    ACTIVE = 'ACTIVE',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    DISABLED = 'DISABLED',
}

export class UpdateUserStatusDto {
    @IsNotEmpty({ message: 'El campo status es obligatorio.' })
    @IsEnum(UserStatusEnum, { message: 'El estado ingresado no es válido.' })
    status!: UserStatusEnum;
}