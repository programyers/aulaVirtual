import { SubjectEntity } from '../../infrastructure/persistence/subject.entity';

export interface ISubjectRepository {
    create(subject: Partial<SubjectEntity>): Promise<SubjectEntity>;
    findById(id: string): Promise<SubjectEntity | null>;
    findByCode(code: string): Promise<SubjectEntity | null>;
    findByTeacherId(teacherId: string): Promise<SubjectEntity[]>;
}