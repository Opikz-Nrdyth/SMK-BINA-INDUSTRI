import app from '@adonisjs/core/services/app';
import ws_service from './ws_service.js';
export class WhatsAppService {
    client = null;
    isReady = false;
    qrCode = null;
    isInitializing = false;
    initializationPromise = null;
    static instance;
    static getInstance() {
        if (!WhatsAppService.instance) {
            WhatsAppService.instance = new WhatsAppService();
        }
        return WhatsAppService.instance;
    }
    constructor() {
        console.log('🤖 WhatsApp Service Created - Use /api/whatsapp/initialize to start');
    }
    emitToRoom(event, data) {
        if (ws_service.io) {
            ws_service.io.to('global_room').emit(event, data);
        }
    }
    async initialize() {
        if (this.isInitializing) {
            this.emitToRoom('whatsapp_status', 'WhatsApp sedang dalam proses inisialisasi...');
            return this.initializationPromise;
        }
        if (this.isReady) {
            this.emitToRoom('whatsapp_status', 'WhatsApp sudah siap digunakan');
            return;
        }
        this.isInitializing = true;
        this.initializationPromise = this._initializeClient();
        this.emitToRoom('whatsapp_status', 'Memulai inisialisasi WhatsApp...');
        return this.initializationPromise;
    }
    async _initializeClient() {
        try {
            this.emitToRoom('whatsapp_status', 'Loading modul WhatsApp...');
            const { default: WWebJS } = await import('whatsapp-web.js');
            const { Client, LocalAuth } = WWebJS;
            this.emitToRoom('whatsapp_status', 'Membuat instance WhatsApp client...');
            this.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: 'adonis-elearning',
                    dataPath: app.tmpPath('whatsapp-sessions'),
                }),
                puppeteer: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--no-first-run',
                        '--single-process',
                        '--disable-gpu',
                    ],
                },
            });
            this.emitToRoom('whatsapp_status', 'Menyiapkan event handlers...');
            this.setupEvents();
            this.emitToRoom('whatsapp_status', 'Menginisialisasi WhatsApp client...');
            await Promise.race([
                this.client.initialize(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Initialization timeout after 30s')), 30000)),
            ]);
            this.emitToRoom('whatsapp_status', 'Menunggu autentikasi...');
        }
        catch (error) {
            this.emitToRoom('whatsapp_error', `Gagal inisialisasi: ${error.message}`);
            this.isInitializing = false;
            this.client = null;
            this.initializationPromise = null;
            throw error;
        }
    }
    setupEvents() {
        if (!this.client)
            return;
        this.client.on('qr', (qr) => {
            this.qrCode = qr;
            this.emitToRoom('whatsapp_qr', qr);
            this.emitToRoom('whatsapp_status', 'QR Code diterima, silakan scan...');
        });
        this.client.on('ready', () => {
            this.isReady = true;
            this.isInitializing = false;
            this.qrCode = null;
            this.initializationPromise = null;
            this.emitToRoom('whatsapp_status', 'WhatsApp siap! Bisa mengirim pesan sekarang.');
        });
        this.client.on('authenticated', () => {
            this.qrCode = null;
            this.emitToRoom('whatsapp_status', 'WhatsApp berhasil terautentikasi!');
        });
        this.client.on('auth_failure', (msg) => {
            this.isReady = false;
            this.isInitializing = false;
            this.initializationPromise = null;
            this.emitToRoom('whatsapp_error', `Autentikasi gagal: ${msg}`);
        });
        this.client.on('disconnected', (reason) => {
            this.isReady = false;
            this.isInitializing = false;
            this.client = null;
            this.initializationPromise = null;
            this.emitToRoom('whatsapp_error', `WhatsApp terputus: ${reason}`);
            setTimeout(() => {
                this.emitToRoom('whatsapp_status', 'Auto-restart WhatsApp...');
                this.initialize();
            }, 5000);
        });
        this.client.on('loading_screen', (percent, message) => {
            this.emitToRoom('whatsapp_status', `Loading ${percent}% - ${message}`);
        });
        this.client.on('message', async (message) => {
            if (message.fromMe)
                return;
            this.emitToRoom('whatsapp_message', `Pesan masuk dari ${message.from}: ${message.body}`);
            if (message.body.toLowerCase() === 'ping') {
                await message.reply('🏓 Pong! dari E-Learning Bot');
            }
        });
    }
    async sendMessage(number, message) {
        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp client is not ready.');
        }
        try {
            this.emitToRoom('whatsapp_status', `Mengirim pesan ke ${number}...`);
            let formattedNumber = number.replace(/[\s+\-()]/g, '');
            if (formattedNumber.startsWith('0')) {
                formattedNumber = '62' + formattedNumber.substring(1);
            }
            else if (formattedNumber.startsWith('8')) {
                formattedNumber = '62' + formattedNumber;
            }
            const chatId = formattedNumber.endsWith('@c.us') ? formattedNumber : `${formattedNumber}@c.us`;
            this.emitToRoom('whatsapp_status', `Memeriksa nomor ${number}...`);
            const isRegistered = await this.client.isRegisteredUser(chatId);
            if (!isRegistered) {
                throw new Error(`Nomor ${number} tidak terdaftar di WhatsApp`);
            }
            const result = await this.client.sendMessage(chatId, message);
            this.emitToRoom('whatsapp_status', `Pesan berhasil dikirim ke ${number}`);
            return {
                success: true,
                messageId: result.id._serialized,
                timestamp: result.timestamp,
                to: chatId,
            };
        }
        catch (error) {
            this.emitToRoom('whatsapp_error', `Gagal kirim pesan ke ${number}: ${error.message}`);
            throw new Error(`${error.message}`);
        }
    }
    async bulkSendMessage(numbers, message, delayMs = 2000) {
        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp client is not ready.');
        }
        const results = [];
        this.emitToRoom('whatsapp_status', `Memulai bulk message ke ${numbers.length} nomor...`);
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            try {
                this.emitToRoom('whatsapp_status', `Mengirim ke ${number} (${i + 1}/${numbers.length})...`);
                let formattedNumber = number.replace(/[\s+\-()]/g, '');
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = '62' + formattedNumber.substring(1);
                }
                else if (formattedNumber.startsWith('8')) {
                    formattedNumber = '62' + formattedNumber;
                }
                const chatId = formattedNumber.endsWith('@c.us')
                    ? formattedNumber
                    : `${formattedNumber}@c.us`;
                const isRegistered = await this.client.isRegisteredUser(chatId);
                if (!isRegistered) {
                    results.push({
                        number: number,
                        success: false,
                        error: 'Number not registered on WhatsApp',
                    });
                    this.emitToRoom('whatsapp_status', `Nomor ${number} tidak terdaftar`);
                    continue;
                }
                const result = await this.client.sendMessage(chatId, message);
                results.push({
                    number: number,
                    success: true,
                    messageId: result.id._serialized,
                    timestamp: result.timestamp,
                });
                this.emitToRoom('whatsapp_status', `Berhasil kirim ke ${number}`);
                if (i < numbers.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
            catch (error) {
                results.push({
                    number: number,
                    success: false,
                    error: error.message,
                });
                this.emitToRoom('whatsapp_error', `Gagal kirim ke ${number}: ${error.message}`);
                if (i < numbers.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
        }
        this.emitToRoom('whatsapp_status', `Bulk message selesai: ${results.filter((r) => r.success).length} berhasil, ${results.filter((r) => !r.success).length} gagal`);
        return results;
    }
    async bulkCheckNumbers(numbers) {
        if (!this.isReady || !this.client) {
            throw new Error('WhatsApp client is not ready.');
        }
        const results = [];
        this.emitToRoom('whatsapp_status', `Memeriksa ${numbers.length} nomor...`);
        for (let i = 0; i < numbers.length; i++) {
            const number = numbers[i];
            try {
                this.emitToRoom('whatsapp_status', `Memeriksa nomor ${number}...`);
                let formattedNumber = number.replace(/[\s+\-()]/g, '');
                if (formattedNumber.startsWith('0')) {
                    formattedNumber = '62' + formattedNumber.substring(1);
                }
                else if (formattedNumber.startsWith('8')) {
                    formattedNumber = '62' + formattedNumber;
                }
                const chatId = formattedNumber.endsWith('@c.us')
                    ? formattedNumber
                    : `${formattedNumber}@c.us`;
                const isRegistered = await this.client.isRegisteredUser(chatId);
                results.push({
                    Nomor: number,
                    Terdaftar: isRegistered,
                });
                this.emitToRoom('whatsapp_status', `${number}: ${isRegistered ? 'Terdaftar' : 'Tidak terdaftar'}`);
                if (i < numbers.length - 1) {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                }
            }
            catch (error) {
                results.push({
                    Nomor: number,
                    Terdaftar: false,
                    Error: error.message,
                });
                this.emitToRoom('whatsapp_error', `Gagal periksa ${number}: ${error.message}`);
            }
        }
        this.emitToRoom('whatsapp_status', `Pengecekan selesai: ${results.filter((r) => r.Terdaftar).length} terdaftar, ${results.filter((r) => !r.Terdaftar).length} tidak terdaftar`);
        return results;
    }
    getStatus() {
        return {
            isReady: this.isReady,
            isInitializing: this.isInitializing,
            hasQrCode: !!this.qrCode,
            qrCode: this.qrCode,
            timestamp: new Date().toISOString(),
        };
    }
    getQrCode() {
        return this.qrCode;
    }
    async destroy() {
        if (this.client) {
            try {
                await this.client.destroy();
                this.emitToRoom('whatsapp_status', 'WhatsApp client dimatikan');
            }
            catch (error) {
                this.emitToRoom('whatsapp_error', 'Error mematikan WhatsApp client');
            }
        }
        this.client = null;
        this.isReady = false;
        this.isInitializing = false;
        this.qrCode = null;
        this.initializationPromise = null;
    }
    isClientReady() {
        return this.isReady;
    }
}
export default WhatsAppService.getInstance();
//# sourceMappingURL=whats_app_service.js.map