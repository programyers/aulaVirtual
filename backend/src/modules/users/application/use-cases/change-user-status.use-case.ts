import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { UserStatusEnum } from '../../presentation/dtos/update-user-status.dto';

// 1. Interfaz de salida bien definida
export interface UpdatedUserOutput {
    id: string;
    fullName: string;
    email: string;
    role: string;
    status: string;
}

export class ChangeUserStatusUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    // 2. Tipamos la Promesa con : Promise<UpdatedUserOutput>
    async execute(userId: string, newStatus: UserStatusEnum): Promise<UpdatedUserOutput> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            const error = new Error('Usuario no encontrado.');
            (error as any).statusCode = 404;
            throw error;
        }

        user.status = newStatus;
        await this.userRepository.save(user);

        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            status: user.status,
        };
    }
}