import { Vehicle } from './vehicle.entity';
export declare class Telemetry {
    id: string;
    vehicle: Vehicle;
    lat: number;
    lng: number;
    speed: number;
    fuel: number;
    timestamp: Date;
}
