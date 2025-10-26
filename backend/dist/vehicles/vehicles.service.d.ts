import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { Telemetry } from './entities/telemetry.entity';
import { VehiclesGateway } from './vehicles.gateway';
export declare class VehiclesService implements OnModuleInit {
    private vr;
    private tr;
    private ws;
    constructor(vr: Repository<Vehicle>, tr: Repository<Telemetry>, ws: VehiclesGateway);
    onModuleInit(): Promise<void>;
    private jitter;
    simulateTick(): Promise<void>;
    findAll(plate?: string): Promise<{
        id: any;
        plate: any;
        lat: number;
        lng: number;
        speed: number;
        fuel: number;
        timestamp: any;
    }[]>;
    historyByPlate(plate: string): Promise<{
        lat: number;
        lng: number;
        timestamp: Date;
    }[]>;
}
