import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SubjectEntity } from '../../../subjects/infrastructure/persistence/subject.entity';

export enum SectionType {
    CONTENT = 'CONTENT',
    LIBRARY = 'LIBRARY',
    ASSIGNMENT = 'ASSIGNMENT',
}

@Entity('sections')
export class SectionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'subject_id', type: 'uuid' })
    subjectId!: string;

    @ManyToOne(() => SubjectEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subject_id' })
    subject!: SubjectEntity;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({
        type: 'enum',
        enum: SectionType,
    })
    type!: SectionType;

    @Column({ type: 'int', default: 1 })
    position!: number;

    @Column({ name: 'is_published', type: 'boolean', default: false })
    isPublished!: boolean;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt!: Date | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}