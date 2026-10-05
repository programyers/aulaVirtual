import { Response } from 'express';

export interface ApiResponsePayload<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: any;
}

export class ApiResponse {
    static success<T>(res: Response, statusCode: number = 200, data?: T, message?: string): Response {
        const payload: ApiResponsePayload<T> = {
            success: true,
            ...(message && { message }),
            ...(data !== undefined && { data }),
        };
        return res.status(statusCode).json(payload);
    }

    static error(res: Response, statusCode: number = 500, message: string, errors?: any): Response {
        const payload: ApiResponsePayload<null> = {
            success: false,
            message,
            ...(errors && { errors }),
        };
        return res.status(statusCode).json(payload);
    }
}