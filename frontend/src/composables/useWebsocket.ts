import { io } from 'socket.io-client'
import { onMounted, onUnmounted } from 'vue'
export function useWebsocket(onTelemetry:(p:any)=>void){
  let socket:any
  onMounted(()=>{ socket = io(import.meta.env.VITE_WS_URL, { transports:['websocket'] }); socket.on('telemetry:update', onTelemetry) })
  onUnmounted(()=> socket?.disconnect?.() )
}
