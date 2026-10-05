import { Router } from 'express';
import { authRouter } from '../../../../modules/auth/routes/auth.routes';
import { userRoutes } from '../../../../modules/users/presentation/routes/user.routes';
import subjectRoutes from '../../../../modules/subjects/presentation/routes/subject.routes';

const appRouter = Router();

appRouter.use('/auth', authRouter);
appRouter.use('/users', userRoutes);
appRouter.use('/subjects', subjectRoutes);

export { appRouter };