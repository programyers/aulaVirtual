import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SectionEntity } from '../../../sections/infrastructure/persistence/section.entity';

@Entity('resources')
export class ResourceEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'section_id', type: 'uuid' })
    sectionId!: string;

    @ManyToOne(() => SectionEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section!: SectionEntity;

    @Column({ name: 'file_key', type: 'varchar', length: 255 })
    fileKey!: string;

    @Column({ name: 'original_name', type: 'varchar', length: 255 })
    originalName!: string;

    @Column({ name: 'mime_type', type: 'varchar', length: 100 })
    mimeType!: string;

    @Column({ name: 'file_size', type: 'int' })
    fileSize!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;
}