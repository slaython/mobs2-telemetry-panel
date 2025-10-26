import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, Index } from 'typeorm'
import { Vehicle } from './vehicle.entity'

@Entity('telemetry')
export class Telemetry {
  @PrimaryGeneratedColumn('uuid') id: string
  @ManyToOne(() => Vehicle, v => v.telemetry, { onDelete: 'CASCADE' })
  vehicle!: Vehicle
  @Index() @Column('double precision') lat: number
  @Index() @Column('double precision') lng: number
  @Column('double precision') speed: number
  @Column('double precision') fuel: number
  @CreateDateColumn({ type: 'timestamptz' }) timestamp!: Date
}
