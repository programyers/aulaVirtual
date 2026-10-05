import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { UserEntity } from '../../../modules/users/infrastructure/persistence/user.entity';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'aula_virtual',
    synchronize: false, // Las tablas se controlan únicamente por migraciones[cite: 1, 3]
    logging: true,
    entities: [__dirname + '/../../../modules/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    subscribers: [],
});