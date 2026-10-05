import { UserEntity } from "../../infrastructure/persistence/user.entity";

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  findAll(): Promise<UserEntity[]>;
  save(userData: Partial<UserEntity>): Promise<UserEntity>;
}
