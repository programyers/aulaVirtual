import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../shared/infrastructure/http/interfaces/authenticated-request.interface';
import { CreateSubjectUseCase } from '../../application/use-cases/create-subject.use-case';
import { GetTeacherSubjectsUseCase } from '../../application/use-cases/get-teacher-subjects.use-case';
import { EnrollStudentUseCase } from '../../application/use-cases/enroll-student.use-case';
import { GetStudentSubjectsUseCase } from '../../application/use-cases/get-student-subjects.use-case';

export class SubjectController {
    constructor(
        private readonly createSubjectUseCase: CreateSubjectUseCase,
        private readonly getTeacherSubjectsUseCase: GetTeacherSubjectsUseCase,
        private readonly enrollStudentUseCase: EnrollStudentUseCase,
        private readonly getStudentSubjectsUseCase: GetStudentSubjectsUseCase,
    ) { }

    createSubject = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const teacherId = req.user!.id;
            const subject = await this.createSubjectUseCase.execute(teacherId, req.body);
            return res.status(201).json({
                message: 'Asignatura creada exitosamente',
                data: subject,
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };

    getTeacherSubjects = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const teacherId = req.user!.id;
            const subjects = await this.getTeacherSubjectsUseCase.execute(teacherId);
            return res.status(200).json({ data: subjects });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };

    enrollStudent = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const studentId = req.user!.id;
            const { code } = req.body;
            const enrollment = await this.enrollStudentUseCase.execute(studentId, code);
            return res.status(201).json({
                message: 'Inscripción realizada exitosamente',
                data: enrollment,
            });
        } catch (error: any) {
            return res.status(400).json({ message: error.message });
        }
    };

    getStudentSubjects = async (req: AuthenticatedRequest, res: Response) => {
        try {
            const studentId = req.user!.id;
            const subjects = await this.getStudentSubjectsUseCase.execute(studentId);
            return res.status(200).json({ data: subjects });
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    };
}