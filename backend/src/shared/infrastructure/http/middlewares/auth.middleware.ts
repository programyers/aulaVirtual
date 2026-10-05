import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, UserPayload } from '../interfaces/authenticated-request.interface';
import { ApiResponse } from '../response/api-response';

export const authenticateJWT = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ApiResponse.error(res, 401, 'Token de autenticación no proporcionado');
        return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'default_secret';

    try {
        const decoded = jwt.verify(token, secret) as UserPayload;
        req.user = decoded;
        next();
    } catch (error) {
        ApiResponse.error(res, 401, 'Token inválido o expirado');
    }
};