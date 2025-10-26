import { Controller, Get, Query, Param, Post } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private svc: VehiclesService) {}

  @Get()
  async list(@Query('plate') plate?: string) {
    return this.svc.findAll(plate);
  }

  @Get(':plate/history')
  async history(@Param('plate') plate: string) {
    return this.svc.historyByPlate(plate);
  }

  @Get(':plate/history/snapped')
  async snappedHistory(@Param('plate') plate: string) {
    return this.svc.getSnappedHistory(plate);
  }

  // <<< NOVO >>>
  @Post(':plate/refuel')
  async refuel(@Param('plate') plate: string) {
    return this.svc.refuelVehicle(plate);
  }
}
