import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../../../shared/infrastructure/http/interfaces/authenticated-request.interface";
import { ChangeUserStatusUseCase } from "../../application/use-cases/change-user-status.use-case";
import { GetUsersUseCase } from "../../application/use-cases/get-users.use-case"; // 1. Importar el nuevo caso de uso
import { ApiResponse } from "../../../../shared/infrastructure/http/response/api-response";

export class UserController {
  constructor(
    private readonly changeUserStatusUseCase: ChangeUserStatusUseCase,
    private readonly getUsersUseCase: GetUsersUseCase, // 2. Inyectar el caso de uso
  ) {}

  // 3. Método para obtener todos los usuarios
  public getAllUsers = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const users = await this.getUsersUseCase.execute();
      ApiResponse.success(
        res,
        200,
        users,
        "Lista de usuarios obtenida exitosamente.",
      );
    } catch (error) {
      next(error);
    }
  };

  public changeStatus = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { status } = req.body;

      const updatedUser = await this.changeUserStatusUseCase.execute(
        id,
        status,
      );
      ApiResponse.success(
        res,
        200,
        updatedUser,
        "Estado del usuario actualizado exitosamente.",
      );
    } catch (error) {
      next(error);
    }
  };
}
