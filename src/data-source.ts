import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Address } from './entity/Address';
import { User } from './entity/User';

export let AppDataSource: DataSource;

export function dataSourceSetup() {
  AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: Number(process.env.POSTGRES_PORT),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    synchronize: true,
    logging: false,
    entities: [User, Address],
    migrations: [],
    subscribers: [],
  });
}
