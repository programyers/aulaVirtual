import bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/ports/password-hasher.interface';

export class BcryptPasswordHasher implements IPasswordHasher {
    private readonly saltRounds = 10;

    async hash(plainText: string): Promise<string> {
        return bcrypt.hash(plainText, this.saltRounds);
    }

    async compare(plainText: string, hashedText: string): Promise<boolean> {
        return bcrypt.compare(plainText, hashedText);
    }
}