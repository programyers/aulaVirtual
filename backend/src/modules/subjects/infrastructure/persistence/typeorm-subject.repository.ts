import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/infrastructure/persistence/data-source';
import { ISubjectRepository } from '../../domain/repositories/subject-repository.interface';
import { SubjectEntity } from './subject.entity';

export class TypeOrmSubjectRepository implements ISubjectRepository {
    private repository: Repository<SubjectEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(SubjectEntity);
    }

    async create(subjectData: Partial<SubjectEntity>): Promise<SubjectEntity> {
        const created = this.repository.create(subjectData);
        return await this.repository.save(created);
    }

    async findById(id: string): Promise<SubjectEntity | null> {
        return await this.repository.findOneBy({ id });
    }

    async findByCode(code: string): Promise<SubjectEntity | null> {
        return await this.repository.findOneBy({ code });
    }

    async findByTeacherId(teacherId: string): Promise<SubjectEntity[]> {
        return await this.repository.findBy({ teacherId });
    }
}