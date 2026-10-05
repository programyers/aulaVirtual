import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { AssignmentEntity } from './assignment.entity';
import { UserEntity } from '../../../users/infrastructure/persistence/user.entity';

export enum SubmissionStatus {
    SUBMITTED = 'SUBMITTED',
    RETURNED = 'RETURNED',
    GRADED = 'GRADED',
}

@Entity('submissions')
@Unique(['assignmentId', 'studentId'])
export class SubmissionEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'assignment_id', type: 'uuid' })
    assignmentId!: string;

    @ManyToOne(() => AssignmentEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'assignment_id' })
    assignment!: AssignmentEntity;

    @Column({ name: 'student_id', type: 'uuid' })
    studentId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'student_id' })
    student!: UserEntity;

    @Column({ name: 'text_content', type: 'text', nullable: true })
    textContent!: string;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    score!: number;

    @Column({ type: 'text', nullable: true })
    feedback!: string;

    @Column({
        type: 'enum',
        enum: SubmissionStatus,
        default: SubmissionStatus.SUBMITTED,
    })
    status!: SubmissionStatus;

    @Column({ name: 'is_late', type: 'boolean', default: false })
    isLate!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}