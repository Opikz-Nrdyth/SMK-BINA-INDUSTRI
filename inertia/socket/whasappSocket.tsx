import { io } from 'socket.io-client'

let socket: any

export const getSocket = () => {
  if (!socket) {
    console.log(import.meta.env.VITE_WEBSOCKET)

    socket = io(import.meta.env.VITE_WEBSOCKET, {
      autoConnect: true,
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('✅ Connected global socket with ID:', socket.id)

      // ✅ AUTO JOIN WHATSAPP ROOM
      socket.emit('join_room')
    })

    socket.on('disconnect', (reason: any) => {
      console.warn('🔌 Disconnected:', reason)
    })

    // ✅ WHATSAPP EVENT LISTENERS
    socket.on('whatsapp_status', (message: string) => {
      console.log('📱 WhatsApp Status:', message)
      // Update UI status di sini
    })

    socket.on('whatsapp_qr', (qrCode: string) => {
      console.log('📱 WhatsApp QR Received')
      // Generate QR code di sini
    })

    socket.on('whatsapp_error', (error: string) => {
      console.error('📱 WhatsApp Error:', error)
      // Show error di UI
    })

    socket.on('whatsapp_message', (message: string) => {
      console.log('📱 WhatsApp Message:', message)
      // Add to message log
    })
  }

  return socket
}
