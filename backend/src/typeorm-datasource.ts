import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Vehicle } from './vehicles/entities/vehicle.entity'
import { Telemetry } from './vehicles/entities/telemetry.entity'

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Vehicle, Telemetry],
  migrations: ['dist/migrations/*.js'],
  synchronize: false, // SEMPRE false em prod
})
