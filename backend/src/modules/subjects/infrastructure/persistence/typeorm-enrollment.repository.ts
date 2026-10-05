import { Repository } from 'typeorm';
import { AppDataSource } from '../../../../shared/infrastructure/persistence/data-source';
import { IEnrollmentRepository } from '../../domain/repositories/enrollment-repository.interface';
import { EnrollmentEntity, EnrollmentStatus } from './enrollment.entity';
import { SubjectEntity } from './subject.entity';

export class TypeOrmEnrollmentRepository implements IEnrollmentRepository {
    private enrollmentRepo: Repository<EnrollmentEntity>;
    private subjectRepo: Repository<SubjectEntity>;

    constructor() {
        this.enrollmentRepo = AppDataSource.getRepository(EnrollmentEntity);
        this.subjectRepo = AppDataSource.getRepository(SubjectEntity);
    }

    async enroll(enrollmentData: Partial<EnrollmentEntity>): Promise<EnrollmentEntity> {
        const created = this.enrollmentRepo.create(enrollmentData);
        return await this.enrollmentRepo.save(created);
    }

    async findEnrollment(studentId: string, subjectId: string): Promise<EnrollmentEntity | null> {
        return await this.enrollmentRepo.findOneBy({ studentId, subjectId });
    }

    async findSubjectsByStudentId(studentId: string): Promise<SubjectEntity[]> {
        const enrollments = await this.enrollmentRepo.findBy({
            studentId,
            status: EnrollmentStatus.ACTIVE,
        });

        if (enrollments.length === 0) return [];

        const subjectIds = enrollments.map((e) => e.subjectId);

        return await this.subjectRepo.createQueryBuilder('subject')
            .where('subject.id IN (:...subjectIds)', { subjectIds })
            .getMany();
    }
}