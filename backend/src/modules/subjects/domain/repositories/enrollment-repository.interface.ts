import { EnrollmentEntity } from '../../infrastructure/persistence/enrollment.entity';
import { SubjectEntity } from '../../infrastructure/persistence/subject.entity';

export interface IEnrollmentRepository {
    enroll(enrollment: Partial<EnrollmentEntity>): Promise<EnrollmentEntity>;
    findEnrollment(studentId: string, subjectId: string): Promise<EnrollmentEntity | null>;
    findSubjectsByStudentId(studentId: string): Promise<SubjectEntity[]>;
}