import { IUserRepository } from "../../domain/repositories/user-repository.interface";
import { UserEntity } from "../../infrastructure/persistence/user.entity";

export class GetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<Omit<UserEntity, "passwordHash">[]> {
    const users = await this.userRepository.findAll();

    return users.map((user) => {
      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
}
