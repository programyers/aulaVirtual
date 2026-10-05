import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/user.entity';
import { SubjectEntity } from './subject.entity';

export enum EnrollmentStatus {
    ACTIVE = 'ACTIVE',
    DROPPED = 'DROPPED',
}

@Entity('enrollments')
@Unique(['studentId', 'subjectId'])
export class EnrollmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'student_id', type: 'uuid' })
    studentId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student!: UserEntity;

    @Column({ name: 'subject_id', type: 'uuid' })
    subjectId!: string;

    @ManyToOne(() => SubjectEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subject_id' })
    subject!: SubjectEntity;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ACTIVE,
    })
    status!: EnrollmentStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}