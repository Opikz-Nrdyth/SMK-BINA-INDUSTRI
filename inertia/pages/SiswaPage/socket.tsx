// resources/js/socketClient.ts
import { io } from 'socket.io-client'

let socket: any

export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_WEBSOCKET, {
      autoConnect: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('✅ Connected global socket with ID:', socket.id)
    })

    socket.on('disconnect', (reason: any) => {
      console.warn('🔌 Disconnected:', reason)
    })
  }

  return socket
}
