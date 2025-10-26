import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class VehiclesGateway {
  @WebSocketServer() server!: Server
  emitTelemetry(payload: any) { this.server.emit('telemetry:update', payload) }
}
