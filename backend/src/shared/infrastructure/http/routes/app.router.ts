import { Router } from 'express';
import { authRouter } from '../../../../modules/auth/routes/auth.routes';
import { userRoutes } from '../../../../modules/users/presentation/routes/user.routes';

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', userRoutes);

export { appRouter };