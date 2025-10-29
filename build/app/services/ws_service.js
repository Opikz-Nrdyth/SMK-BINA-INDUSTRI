import { Server } from 'socket.io';
import server from '@adonisjs/core/services/server';
import whats_app_service from './whats_app_service.js';
class Ws {
    io = null;
    booted = false;
    boot() {
        if (this.booted)
            return;
        this.booted = true;
        this.io = new Server(server.getNodeServer(), {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });
        this.registerHandlers();
    }
    registerHandlers() {
        if (!this.io)
            return;
        this.io.on('connection', (socket) => {
            console.log(`[+] Connected: ${socket.id}`);
            const GLOBAL_ROOM = 'global_room';
            socket.join(GLOBAL_ROOM);
            console.log(`Socket ${socket.id} joined ${GLOBAL_ROOM}`);
            this.io?.to(GLOBAL_ROOM).emit('user_joined', {
                id: socket.id,
                message: `User ${socket.id} joined the room.`,
            });
            socket.on('send_message', (data) => {
                console.log(`[Room] ${socket.id}: ${data.message}`);
                this.io?.to(GLOBAL_ROOM).emit('new_message', {
                    from: socket.id,
                    message: data.message,
                });
            });
            socket.on('disconnect', () => {
                console.log(`[-] Disconnected: ${socket.id}`);
            });
            socket.on('whatsapp_initialize', async () => {
                try {
                    socket.emit('whatsapp_status', `[WhatsApp] ${socket.id} requested initialization`);
                    await whats_app_service.initialize();
                }
                catch (error) {
                    socket.emit('whatsapp_error', error.message);
                }
            });
            socket.on('whatsapp_get_status', () => {
                try {
                    const status = whats_app_service.getStatus();
                    socket.emit('whatsapp_status_update', status);
                }
                catch (error) {
                    socket.emit('whatsapp_error', error.message);
                }
            });
            socket.on('whatsapp_get_qr', () => {
                try {
                    const qrCode = whats_app_service.getQrCode();
                    const status = whats_app_service.getStatus();
                    if (qrCode) {
                        socket.emit('whatsapp_qr', qrCode);
                    }
                    else {
                        socket.emit('whatsapp_status', status.isReady ? 'WhatsApp sudah terhubung' : 'QR code belum tersedia');
                    }
                }
                catch (error) {
                    socket.emit('whatsapp_error', error.message);
                }
            });
            socket.on('whatsapp_destroy', async () => {
                try {
                    await whats_app_service.destroy();
                    socket.emit('whatsapp_status', 'WhatsApp client dimatikan');
                }
                catch (error) {
                    socket.emit('whatsapp_error', error.message);
                }
            });
        });
    }
}
export default new Ws();
//# sourceMappingURL=ws_service.js.map