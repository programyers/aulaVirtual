import { Router } from "express";
import { AuthController } from "../presentation/controllers/auth.controller";
import { LoginUseCase } from "../application/use-cases/login.use-case";
import { RegisterUseCase } from "../application/use-cases/register.use-case";
import { TypeOrmUserRepository } from "../../auth/infrastructure/persistence/typeorm-user.repository";
import { BcryptPasswordHasher } from "../infrastructure/adapters/bcrypt-password-hasher";
import { JwtTokenService } from "../infrastructure/adapters/jwt-token-service";
import { validateDto } from "../../../shared/infrastructure/http/middlewares/validate-dto.middleware";
import { authenticateJWT } from "../../../shared/infrastructure/http/middlewares/auth.middleware";
import { LoginDto } from "../presentation/dtos/login.dto";
import { RegisterDto } from "../presentation/dtos/register.dto";
import { UserController } from "../../users/presentation/controllers/user.controller";

const router = Router();

const userRepository = new TypeOrmUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();

const loginUseCase = new LoginUseCase(
  userRepository,
  passwordHasher,
  tokenService,
);
const registerUseCase = new RegisterUseCase(userRepository, passwordHasher);

const controller = new AuthController(loginUseCase, registerUseCase);

router.post("/login", validateDto(LoginDto), controller.login);
router.post("/register", validateDto(RegisterDto), controller.register);

router.get("/me", authenticateJWT, controller.me);

export { router as authRouter };
