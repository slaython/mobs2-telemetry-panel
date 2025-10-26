import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import { Telemetry } from './telemetry.entity'

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid') id: string
  @Column({ unique: true }) plate: string
  @Column({ default: true }) active: boolean
  @OneToMany(() => Telemetry, t => t.vehicle) telemetry!: Telemetry[]
}
