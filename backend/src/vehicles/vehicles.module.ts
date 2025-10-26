import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Vehicle } from './entities/vehicle.entity'
import { Telemetry } from './entities/telemetry.entity'
import { VehiclesService } from './vehicles.service'
import { VehiclesController } from './vehicles.controller'
import { VehiclesGateway } from './vehicles.gateway'

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Telemetry])],
  providers: [VehiclesService, VehiclesGateway],
  controllers: [VehiclesController],
})
export class VehiclesModule {}
