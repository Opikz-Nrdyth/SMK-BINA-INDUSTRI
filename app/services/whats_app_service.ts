import app from '@adonisjs/core/services/app'
import ws_service from './ws_service.js'

export class WhatsAppService {
  private client: any = null
  private isReady: boolean = false
  private qrCode: string | null = null
  private isInitializing: boolean = false
  private initializationPromise: Promise<void> | null = null

  // Singleton instance
  private static instance: WhatsAppService

  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService()
    }
    return WhatsAppService.instance
  }

  private constructor() {
    console.log('🤖 WhatsApp Service Created - Use /api/whatsapp/initialize to start')
  }

  // ✅ HELPER METHOD UNTUK EMIT KE ROOM
  private emitToRoom(event: string, data: any) {
    if (ws_service.io) {
      ws_service.io.to('global_room').emit(event, data)
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitializing) {
      this.emitToRoom('whatsapp_status', 'WhatsApp sedang dalam proses inisialisasi...')
      return this.initializationPromise!
    }

    if (this.isReady) {
      this.emitToRoom('whatsapp_status', 'WhatsApp sudah siap digunakan')
      return
    }

    this.isInitializing = true
    this.initializationPromise = this._initializeClient()

    this.emitToRoom('whatsapp_status', 'Memulai inisialisasi WhatsApp...')
    return this.initializationPromise
  }

  private async _initializeClient(): Promise<void> {
    try {
      this.emitToRoom('whatsapp_status', 'Loading modul WhatsApp...')

      const { default: WWebJS } = await import('whatsapp-web.js')
      const { Client, LocalAuth } = WWebJS

      this.emitToRoom('whatsapp_status', 'Membuat instance WhatsApp client...')

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
      })

      this.emitToRoom('whatsapp_status', 'Menyiapkan event handlers...')

      this.setupEvents()

      this.emitToRoom('whatsapp_status', 'Menginisialisasi WhatsApp client...')

      await Promise.race([
        this.client.initialize(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Initialization timeout after 30s')), 30000)
        ),
      ])

      this.emitToRoom('whatsapp_status', 'Menunggu autentikasi...')
    } catch (error: any) {
      this.emitToRoom('whatsapp_error', `Gagal inisialisasi: ${error.message}`)
      this.isInitializing = false
      this.client = null
      this.initializationPromise = null
      throw error
    }
  }

  private setupEvents() {
    if (!this.client) return

    this.client.on('qr', (qr: string) => {
      this.qrCode = qr
      this.emitToRoom('whatsapp_qr', qr)
      this.emitToRoom('whatsapp_status', 'QR Code diterima, silakan scan...')
    })

    this.client.on('ready', () => {
      this.isReady = true
      this.isInitializing = false
      this.qrCode = null
      this.initializationPromise = null
      this.emitToRoom('whatsapp_status', 'WhatsApp siap! Bisa mengirim pesan sekarang.')
    })

    this.client.on('authenticated', () => {
      this.qrCode = null
      this.emitToRoom('whatsapp_status', 'WhatsApp berhasil terautentikasi!')
    })

    this.client.on('auth_failure', (msg: string) => {
      this.isReady = false
      this.isInitializing = false
      this.initializationPromise = null
      this.emitToRoom('whatsapp_error', `Autentikasi gagal: ${msg}`)
    })

    this.client.on('disconnected', (reason: string) => {
      this.isReady = false
      this.isInitializing = false
      this.client = null
      this.initializationPromise = null
      this.emitToRoom('whatsapp_error', `WhatsApp terputus: ${reason}`)

      setTimeout(() => {
        this.emitToRoom('whatsapp_status', 'Auto-restart WhatsApp...')
        this.initialize()
      }, 5000)
    })

    this.client.on('loading_screen', (percent: number, message: string) => {
      this.emitToRoom('whatsapp_status', `Loading ${percent}% - ${message}`)
    })

    this.client.on('message', async (message: any) => {
      if (message.fromMe) return

      this.emitToRoom('whatsapp_message', `Pesan masuk dari ${message.from}: ${message.body}`)

      if (message.body.toLowerCase() === 'ping') {
        await message.reply('🏓 Pong! dari E-Learning Bot')
      }
    })
  }

  public async sendMessage(number: string, message: string): Promise<any> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client is not ready.')
    }

    try {
      this.emitToRoom('whatsapp_status', `Mengirim pesan ke ${number}...`)

      let formattedNumber = number.replace(/[\s+\-()]/g, '')
      if (formattedNumber.startsWith('0')) {
        formattedNumber = '62' + formattedNumber.substring(1)
      } else if (formattedNumber.startsWith('8')) {
        formattedNumber = '62' + formattedNumber
      }
      const chatId = formattedNumber.endsWith('@c.us') ? formattedNumber : `${formattedNumber}@c.us`

      this.emitToRoom('whatsapp_status', `Memeriksa nomor ${number}...`)

      const isRegistered = await this.client.isRegisteredUser(chatId)
      if (!isRegistered) {
        throw new Error(`Nomor ${number} tidak terdaftar di WhatsApp`)
      }

      const result = await this.client.sendMessage(chatId, message)

      this.emitToRoom('whatsapp_status', `Pesan berhasil dikirim ke ${number}`)

      return {
        success: true,
        messageId: result.id._serialized,
        timestamp: result.timestamp,
        to: chatId,
      }
    } catch (error: any) {
      this.emitToRoom('whatsapp_error', `Gagal kirim pesan ke ${number}: ${error.message}`)
      throw new Error(`${error.message}`)
    }
  }

  public async bulkSendMessage(
    numbers: string[],
    message: string,
    delayMs: number = 2000
  ): Promise<any[]> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client is not ready.')
    }

    const results = []

    this.emitToRoom('whatsapp_status', `Memulai bulk message ke ${numbers.length} nomor...`)

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i]

      try {
        this.emitToRoom('whatsapp_status', `Mengirim ke ${number} (${i + 1}/${numbers.length})...`)

        let formattedNumber = number.replace(/[\s+\-()]/g, '')
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '62' + formattedNumber.substring(1)
        } else if (formattedNumber.startsWith('8')) {
          formattedNumber = '62' + formattedNumber
        }
        const chatId = formattedNumber.endsWith('@c.us')
          ? formattedNumber
          : `${formattedNumber}@c.us`

        const isRegistered = await this.client.isRegisteredUser(chatId)
        if (!isRegistered) {
          results.push({
            number: number,
            success: false,
            error: 'Number not registered on WhatsApp',
          })
          this.emitToRoom('whatsapp_status', `Nomor ${number} tidak terdaftar`)
          continue
        }

        const result = await this.client.sendMessage(chatId, message)

        results.push({
          number: number,
          success: true,
          messageId: result.id._serialized,
          timestamp: result.timestamp,
        })

        this.emitToRoom('whatsapp_status', `Berhasil kirim ke ${number}`)

        if (i < numbers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      } catch (error: any) {
        results.push({
          number: number,
          success: false,
          error: error.message,
        })
        this.emitToRoom('whatsapp_error', `Gagal kirim ke ${number}: ${error.message}`)

        if (i < numbers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
      }
    }

    this.emitToRoom(
      'whatsapp_status',
      `Bulk message selesai: ${results.filter((r) => r.success).length} berhasil, ${results.filter((r) => !r.success).length} gagal`
    )

    return results
  }

  public async bulkCheckNumbers(numbers: string[]): Promise<any[]> {
    if (!this.isReady || !this.client) {
      throw new Error('WhatsApp client is not ready.')
    }

    const results = []

    this.emitToRoom('whatsapp_status', `Memeriksa ${numbers.length} nomor...`)

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i]

      try {
        this.emitToRoom('whatsapp_status', `Memeriksa nomor ${number}...`)

        let formattedNumber = number.replace(/[\s+\-()]/g, '')
        if (formattedNumber.startsWith('0')) {
          formattedNumber = '62' + formattedNumber.substring(1)
        } else if (formattedNumber.startsWith('8')) {
          formattedNumber = '62' + formattedNumber
        }
        const chatId = formattedNumber.endsWith('@c.us')
          ? formattedNumber
          : `${formattedNumber}@c.us`

        const isRegistered = await this.client.isRegisteredUser(chatId)

        results.push({
          Nomor: number,
          Terdaftar: isRegistered,
        })

        this.emitToRoom(
          'whatsapp_status',
          `${number}: ${isRegistered ? 'Terdaftar' : 'Tidak terdaftar'}`
        )

        if (i < numbers.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      } catch (error: any) {
        results.push({
          Nomor: number,
          Terdaftar: false,
          Error: error.message,
        })
        this.emitToRoom('whatsapp_error', `Gagal periksa ${number}: ${error.message}`)
      }
    }

    this.emitToRoom(
      'whatsapp_status',
      `Pengecekan selesai: ${results.filter((r) => r.Terdaftar).length} terdaftar, ${results.filter((r) => !r.Terdaftar).length} tidak terdaftar`
    )

    return results
  }

  public getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      hasQrCode: !!this.qrCode,
      qrCode: this.qrCode,
      timestamp: new Date().toISOString(),
    }
  }

  public getQrCode(): string | null {
    return this.qrCode
  }

  public async destroy() {
    if (this.client) {
      try {
        await this.client.destroy()
        this.emitToRoom('whatsapp_status', 'WhatsApp client dimatikan')
      } catch (error) {
        this.emitToRoom('whatsapp_error', 'Error mematikan WhatsApp client')
      }
    }
    this.client = null
    this.isReady = false
    this.isInitializing = false
    this.qrCode = null
    this.initializationPromise = null
  }

  public isClientReady(): boolean {
    return this.isReady
  }
}

// Export singleton instance
export default WhatsAppService.getInstance()
