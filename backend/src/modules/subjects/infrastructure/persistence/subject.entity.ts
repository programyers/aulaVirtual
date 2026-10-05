import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/user.entity';

@Entity('subjects')
export class SubjectEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'teacher_id', type: 'uuid' })
    teacherId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'teacher_id' })
    teacher!: UserEntity;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'varchar', length: 20, unique: true })
    code!: string;

    @Column({ name: 'is_archived', type: 'boolean', default: false })
    isArchived!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}