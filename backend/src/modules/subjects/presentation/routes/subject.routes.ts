import { Router } from 'express';
import { authenticateJWT } from '../../../../shared/infrastructure/http/middlewares/auth.middleware';
import { authorizeRoles } from '../../../../shared/infrastructure/http/middlewares/roles.middleware';
import { TypeOrmSubjectRepository } from '../../infrastructure/persistence/typeorm-subject.repository';
import { TypeOrmEnrollmentRepository } from '../../infrastructure/persistence/typeorm-enrollment.repository';
import { CreateSubjectUseCase } from '../../application/use-cases/create-subject.use-case';
import { GetTeacherSubjectsUseCase } from '../../application/use-cases/get-teacher-subjects.use-case';
import { EnrollStudentUseCase } from '../../application/use-cases/enroll-student.use-case';
import { GetStudentSubjectsUseCase } from '../../application/use-cases/get-student-subjects.use-case';
import { SubjectController } from '../controllers/subject.controller';

const router = Router();

// Instancias de repositorios
const subjectRepo = new TypeOrmSubjectRepository();
const enrollmentRepo = new TypeOrmEnrollmentRepository();

// Instancias de casos de uso
const createSubjectUseCase = new CreateSubjectUseCase(subjectRepo);
const getTeacherSubjectsUseCase = new GetTeacherSubjectsUseCase(subjectRepo);
const enrollStudentUseCase = new EnrollStudentUseCase(subjectRepo, enrollmentRepo);
const getStudentSubjectsUseCase = new GetStudentSubjectsUseCase(enrollmentRepo);

// Instancia del controlador
const controller = new SubjectController(
    createSubjectUseCase,
    getTeacherSubjectsUseCase,
    enrollStudentUseCase,
    getStudentSubjectsUseCase,
);

// Rutas de Docente
router.post('/', authenticateJWT, authorizeRoles('TEACHER'), controller.createSubject);
router.get('/teacher', authenticateJWT, authorizeRoles('TEACHER'), controller.getTeacherSubjects);

// Rutas de Estudiante
router.post('/enroll', authenticateJWT, authorizeRoles('STUDENT'), controller.enrollStudent);
router.get('/student', authenticateJWT, authorizeRoles('STUDENT'), controller.getStudentSubjects);

export default router;