import { ISubjectRepository } from '../../domain/repositories/subject-repository.interface';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment-repository.interface';
import { EnrollmentEntity } from '../../infrastructure/persistence/enrollment.entity';

export class EnrollStudentUseCase {
    constructor(
        private readonly subjectRepository: ISubjectRepository,
        private readonly enrollmentRepository: IEnrollmentRepository,
    ) { }

    async execute(studentId: string, code: string): Promise<EnrollmentEntity> {
        const cleanCode = code.trim().toUpperCase();
        const subject = await this.subjectRepository.findByCode(cleanCode);

        if (!subject) {
            throw new Error('Código de asignatura no válido o inexistente');
        }

        const existingEnrollment = await this.enrollmentRepository.findEnrollment(
            studentId,
            subject.id,
        );

        if (existingEnrollment) {
            throw new Error('Ya te encuentras inscrito en esta asignatura');
        }

        return await this.enrollmentRepository.enroll({
            studentId,
            subjectId: subject.id,
        });
    }
}