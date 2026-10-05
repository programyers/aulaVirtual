import { Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { ApiResponse } from '../../../../shared/infrastructure/http/response/api-response';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/http/interfaces/authenticated-request.interface';

export class AuthController {
    constructor(
        private loginUseCase: LoginUseCase,
        private registerUseCase: RegisterUseCase
    ) { }

    public login = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.loginUseCase.execute(req.body);
            ApiResponse.success(res, 200, result, 'Inicio de sesión exitoso');
        } catch (error) {
            next(error);
        }
    };

    public register = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.registerUseCase.execute(req.body);
            ApiResponse.success(res, 201, result, 'Usuario registrado exitosamente');
        } catch (error) {
            next(error);
        }
    };

    public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            ApiResponse.success(res, 200, req.user, 'Perfil del usuario autenticado');
        } catch (error) {
            next(error);
        }
    };
}