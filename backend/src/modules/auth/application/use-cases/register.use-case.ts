import { IUserRepository } from '../../../users/domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../../domain/ports/password-hasher.interface';
import { RegisterDto } from '../../presentation/dtos/register.dto';

export class RegisterUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher
    ) { }

    async execute(dto: RegisterDto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw { statusCode: 409, message: 'El correo electrónico ya está registrado' };
        }

        const hashedPassword = await this.passwordHasher.hash(dto.password);
        const initialStatus: 'PENDING_APPROVAL' | 'ACTIVE' =
            dto.role === 'TEACHER' ? 'PENDING_APPROVAL' : 'ACTIVE';

        const newUser = await this.userRepository.save({
            email: dto.email,
            passwordHash: hashedPassword, // camelCase
            fullName: dto.fullName,        // camelCase
            role: dto.role,
            status: initialStatus,
        });

        return {
            id: newUser.id,
            email: newUser.email,
            fullName: newUser.fullName,
            role: newUser.role,
            status: newUser.status,
        };
    }
}