import { Repository } from "typeorm";
import { AppDataSource } from "../../../../shared/infrastructure/persistence/data-source";
import { UserEntity } from "../../../users/infrastructure/persistence/user.entity";
import { IUserRepository } from "../../domain/repositories/user-repository.interface";

export class TypeOrmUserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
  async findAll(): Promise<UserEntity[]> {
    return await this.repository.find();
  }

  async save(userData: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.repository.create(userData);
    return this.repository.save(user);
  }
}
