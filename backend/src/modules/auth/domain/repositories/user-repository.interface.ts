import { UserEntity } from '../../../users/infrastructure/persistence/user.entity';

export interface IUserRepository {
    findByEmail(email: string): Promise<UserEntity | null>;
    findById(id: string): Promise<UserEntity | null>;
    save(user: Partial<UserEntity>): Promise<UserEntity>;
}