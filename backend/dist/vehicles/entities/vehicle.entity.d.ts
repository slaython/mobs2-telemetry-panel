import { Telemetry } from './telemetry.entity';
export declare class Vehicle {
    id: string;
    plate: string;
    active: boolean;
    telemetry: Telemetry[];
}
