import { IUserRepository } from '../../../users/domain/repositories/user-repository.interface';
import { IPasswordHasher } from '../../domain/ports/password-hasher.interface';
import { ITokenService } from '../../domain/ports/token-service.interface';
import { LoginDto } from '../../presentation/dtos/login.dto';

export class LoginUseCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService
    ) { }

    async execute(dto: LoginDto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw { statusCode: 401, message: 'Credenciales inválidas' };
        }

        // Bloqueo de cuentas inhabilitadas
        if (user.status === 'DISABLED') {
            throw { statusCode: 403, message: 'La cuenta se encuentra inhabilitada' };
        }

        // Bloqueo de docentes pendientes de aprobación por el Administrador
        if (user.status === 'PENDING_APPROVAL') {
            throw {
                statusCode: 403,
                message: 'Su cuenta de docente se encuentra pendiente de aprobación por un administrador',
            };
        }

        const hashedPassword = (user as any).passwordHash || (user as any).password_hash;
        const isPasswordValid = await this.passwordHasher.compare(dto.password, hashedPassword);

        if (!isPasswordValid) {
            throw { statusCode: 401, message: 'Credenciales inválidas' };
        }

        const accessToken = this.tokenService.generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: (user as any).fullName || (user as any).full_name,
                role: user.role,
                status: user.status,
            },
        };
    }
}