import { Repository } from "typeorm";
import { AppDataSource } from "../../../../shared/infrastructure/persistence/data-source";
import { UserEntity } from "../persistence/user.entity";
import { IUserRepository } from "../../domain/repositories/user-repository.interface";

export class TypeOrmUserRepository implements IUserRepository {
  private get repository(): Repository<UserEntity> {
    return AppDataSource.getRepository(UserEntity);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOneBy({ email });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.repository.find();
  }

  async save(user: Partial<UserEntity>): Promise<UserEntity> {
    return this.repository.save(user);
  }
}
