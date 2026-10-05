import { ISubjectRepository } from '../../domain/repositories/subject-repository.interface';
import { SubjectEntity } from '../../infrastructure/persistence/subject.entity';
import { CreateSubjectDto } from '../../presentation/dtos/create-subject.dto';

export class CreateSubjectUseCase {
    constructor(private readonly subjectRepository: ISubjectRepository) { }

    async execute(teacherId: string, dto: CreateSubjectDto): Promise<SubjectEntity> {
        const code = await this.generateUniqueCode();

        return await this.subjectRepository.create({
            teacherId,
            name: dto.name,
            description: dto.description || undefined,
            code,
            isArchived: false,
        });
    }

    private async generateUniqueCode(): Promise<string> {
        let code = '';
        let isUnique = false;

        while (!isUnique) {
            // Genera un código aleatorio de 6 caracteres en mayúsculas (ej: 8F2A9K)
            code = Math.random().toString(36).substring(2, 8).toUpperCase();
            const existing = await this.subjectRepository.findByCode(code);
            if (!existing) {
                isUnique = true;
            }
        }

        return code;
    }
}