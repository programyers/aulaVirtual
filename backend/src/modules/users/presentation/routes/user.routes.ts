import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { ChangeUserStatusUseCase } from "../../application/use-cases/change-user-status.use-case";
import { GetUsersUseCase } from "../../application/use-cases/get-users.use-case";
import { TypeOrmUserRepository } from "../../infrastructure/adapters/typeorm-user.repository";
import { authenticateJWT } from "../../../../shared/infrastructure/http/middlewares/auth.middleware";
import { authorizeRoles } from "../../../../shared/infrastructure/http/middlewares/roles.middleware";
import { validateDto } from "../../../../shared/infrastructure/http/middlewares/validate-dto.middleware";
import { UpdateUserStatusDto } from "../dtos/update-user-status.dto";

const router = Router();

const userRepository = new TypeOrmUserRepository();

const changeUserStatusUseCase = new ChangeUserStatusUseCase(
  userRepository as any,
);
const getUsersUseCase = new GetUsersUseCase(userRepository as any);

const userController = new UserController(
  changeUserStatusUseCase,
  getUsersUseCase,
);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  userController.getAllUsers,
);

router.patch(
  "/:id/status",
  authenticateJWT,
  authorizeRoles("ADMIN"),
  validateDto(UpdateUserStatusDto),
  userController.changeStatus,
);

export { router as userRoutes };
