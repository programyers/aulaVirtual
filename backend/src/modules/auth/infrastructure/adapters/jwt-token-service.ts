import * as jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../domain/ports/token-service.interface';

export class JwtTokenService implements ITokenService {
    private readonly secret = process.env.JWT_SECRET || 'default_secret';

    generateToken(payload: TokenPayload): string {
        const expiresIn = (process.env.JWT_EXPIRES_IN || '1d') as jwt.SignOptions['expiresIn'];
        return jwt.sign(payload, this.secret, { expiresIn });
    }

    verifyToken(token: string): TokenPayload {
        return jwt.verify(token, this.secret) as TokenPayload;
    }
}