import { IEnrollmentRepository } from '../../domain/repositories/enrollment-repository.interface';
import { SubjectEntity } from '../../infrastructure/persistence/subject.entity';

export class GetStudentSubjectsUseCase {
    constructor(private readonly enrollmentRepository: IEnrollmentRepository) { }

    async execute(studentId: string): Promise<SubjectEntity[]> {
        return await this.enrollmentRepository.findSubjectsByStudentId(studentId);
    }
}