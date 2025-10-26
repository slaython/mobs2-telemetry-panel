import { VehiclesService } from './vehicles.service';
export declare class VehiclesController {
    private svc;
    constructor(svc: VehiclesService);
    list(plate?: string): Promise<{
        id: any;
        plate: any;
        lat: number;
        lng: number;
        speed: number;
        fuel: number;
        timestamp: any;
    }[]>;
    history(plate: string): Promise<{
        lat: number;
        lng: number;
        timestamp: Date;
    }[]>;
}
