import { Server } from 'socket.io';
export declare class VehiclesGateway {
    server: Server;
    emitTelemetry(payload: any): void;
}
