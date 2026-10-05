import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { ApiResponse } from '../response/api-response';

export const validateDto = (type: any) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const dtoInstance = plainToInstance(type, req.body);
        const errors: ValidationError[] = await validate(dtoInstance, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });

        if (errors.length > 0) {
            const formattedErrors = errors.map((err) => ({
                property: err.property,
                constraints: err.constraints,
            }));

            ApiResponse.error(res, 400, 'Error de validación en la petición', formattedErrors);
            return;
        }

        req.body = dtoInstance;
        next();
    };
};