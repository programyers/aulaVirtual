import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from '../../../users/infrastructure/persistence/user.entity';

@Entity('notifications')
export class NotificationEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'user_id', type: 'uuid' })
    userId!: string;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: UserEntity;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text' })
    message!: string;

    @Column({ name: 'is_read', type: 'boolean', default: false })
    isRead!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}