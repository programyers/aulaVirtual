import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SectionEntity } from '../../../sections/infrastructure/persistence/section.entity';

@Entity('assignments')
export class AssignmentEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'section_id', type: 'uuid' })
    sectionId!: string;

    @ManyToOne(() => SectionEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section!: SectionEntity;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    instructions!: string;

    @Column({ name: 'due_at', type: 'timestamp' })
    dueAt!: Date;

    @Column({
        name: 'max_score',
        type: 'decimal',
        precision: 5,
        scale: 2,
        default: 5.0,
    })
    maxScore!: number;

    @Column({ name: 'allow_late', type: 'boolean', default: false })
    allowLate!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}