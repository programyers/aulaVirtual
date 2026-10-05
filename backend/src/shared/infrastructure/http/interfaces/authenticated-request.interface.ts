import { Request } from 'express';

export interface UserPayload {
    id: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface AuthenticatedRequest extends Request {
    user?: UserPayload;
}