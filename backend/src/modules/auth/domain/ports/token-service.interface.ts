export interface TokenPayload {
    id: string;
    email: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface ITokenService {
    generateToken(payload: TokenPayload): string;
    verifyToken(token: string): TokenPayload;
}