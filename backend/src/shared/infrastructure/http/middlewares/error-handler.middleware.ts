import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../response/api-response';

export const errorHandlerMiddleware = (
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Error interno del servidor';
    const errors = error.errors || null;

    console.error(`[HTTP Error] ${req.method} ${req.url}:`, error);

    ApiResponse.error(res, statusCode, message, errors);
};  