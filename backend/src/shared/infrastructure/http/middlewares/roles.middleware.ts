import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';
import { ApiResponse } from '../response/api-response';

export const authorizeRoles = (...allowedRoles: Array<'ADMIN' | 'TEACHER' | 'STUDENT'>) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            ApiResponse.error(res, 401, 'Usuario no autenticado');
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            ApiResponse.error(res, 403, 'No tiene permisos para acceder a este recurso');
            return;
        }

        next();
    };
};