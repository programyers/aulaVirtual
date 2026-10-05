import { ISubjectRepository } from '../../domain/repositories/subject-repository.interface';
import { SubjectEntity } from '../../infrastructure/persistence/subject.entity';

export class GetTeacherSubjectsUseCase {
    constructor(private readonly subjectRepository: ISubjectRepository) { }

    async execute(teacherId: string): Promise<SubjectEntity[]> {
        return await this.subjectRepository.findByTeacherId(teacherId);
    }
}