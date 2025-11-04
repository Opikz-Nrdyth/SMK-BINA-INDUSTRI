import whats_app_service from '#services/whats_app_service'
import whatsAppService from '#services/whats_app_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class WhatsAppController {
  public async getStatus({ response }: HttpContext) {
    try {
      const status = whatsAppService.getStatus()

      return response.json({
        success: true,
        data: status,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get WhatsApp status',
        error: error.message,
      })
    }
  }

  public async getQRCode({ response }: HttpContext) {
    try {
      const qrCode = whatsAppService.getQrCode()
      const status = whatsAppService.getStatus()

      if (!qrCode) {
        return response.json({
          success: true,
          data: {
            hasQrCode: false,
            message: status.isReady
              ? 'WhatsApp is connected and ready!'
              : 'QR code not available yet. Please initialize first.',
            status: status.isReady ? 'connected' : 'disconnected',
            isInitializing: status.isInitializing,
          },
        })
      }

      return response.json({
        success: true,
        data: {
          hasQrCode: true,
          qrCode: qrCode,
          message: 'Scan this QR code with WhatsApp →',
          status: 'waiting_qr_scan',
        },
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: 'Failed to get QR code',
        error: error.message,
      })
    }
  }

  public async initialize({ response, session }: HttpContext) {
    try {
      await whats_app_service.initialize()

      session.flash({
        status: 'success',
        message: 'Berhasil initilasi',
      })
      return response.redirect().withQs().back()
    } catch (error: any) {
      session.flash({
        status: 'error',
        message: 'Gagal initilasi Whatsapp',
      })
    }
  }

  public async sendMessage({ request, response, session }: HttpContext) {
    const { number, message } = request.only(['number', 'message'])

    // Validasi
    if (!number || !message) {
      session.flash({
        status: 'error',
        message: 'Nomor dan Pesan Wajib Diisi!',
      })
      return response.redirect().withQs().back()
    }

    if (message.length > 1000) {
      session.flash({
        status: 'error',
        message: 'Text Terlalu Panjang Maksimum 1000 Karakter',
      })
      return response.redirect().withQs().back()
    }

    try {
      await whatsAppService.sendMessage(number, message)

      session.flash({
        status: 'success',
        message: 'Pesan Berhasil Dikirim',
      })
      return response.redirect().withQs().back()
    } catch (error: any) {
      session.flash({
        status: 'error',
        message: error.message ?? 'Gagal Mengirim Pesan',
      })

      return response.redirect().withQs().back()
    }
  }

  public async bulkSendMessage({ request, response, session }: HttpContext) {
    const { numbers, message, delay } = request.only(['numbers', 'message', 'delay'])

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      session.flash({
        status: 'error',
        message: 'Nomor Wajib Diisi!',
      })
      return response.redirect().withQs().back()
    }

    if (!message) {
      session.flash({
        status: 'error',
        message: 'Pesan Wajib Diisi!',
      })
      return response.redirect().withQs().back()
    }

    // Limit jumlah nomor (optional)
    if (numbers.length > 100) {
      session.flash({
        status: 'error',
        message: 'Maksimal 100 Nomor Per Request',
      })
      return response.redirect().withQs().back()
    }

    try {
      const delayMs = delay || 2000 // Default delay 2 detik
      const results = await whatsAppService.bulkSendMessage(numbers, message, delayMs)

      const successCount = results.filter((r) => r.success).length
      const failedCount = results.filter((r) => !r.success).length

      session.flash({
        status: 'success',
        message: `Bulk message completed: ${successCount} success, ${failedCount} failed`,
      })
      return response.redirect().withQs().back()
    } catch (error: any) {
      session.flash({
        status: 'error',
        message: 'Gagal Mengirim Pesan!',
      })
      return response.redirect().withQs().back()
    }
  }

  public async bulkCheckNumbers({ request, response }: HttpContext) {
    const { numbers } = request.only(['numbers'])

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return response.status(400).json({
        success: false,
        message: 'Numbers array is required and must not be empty',
      })
    }

    // Limit jumlah nomor (optional)
    if (numbers.length > 100) {
      return response.status(400).json({
        success: false,
        message: 'Maximum 100 numbers per request',
      })
    }

    try {
      const results = await whatsAppService.bulkCheckNumbers(numbers)

      const registeredCount = results.filter((r) => r.Terdaftar).length
      const notRegisteredCount = results.filter((r) => !r.Terdaftar).length

      return response.json({
        success: true,
        message: `Bulk check completed: ${registeredCount} registered, ${notRegisteredCount} not registered`,
        data: results,
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: 'Failed to check numbers',
        error: error.message,
      })
    }
  }

  public async destroy({ response }: HttpContext) {
    try {
      await whatsAppService.destroy()

      return response.json({
        success: true,
        message: 'WhatsApp client destroyed successfully',
      })
    } catch (error: any) {
      return response.status(500).json({
        success: false,
        message: 'Failed to destroy WhatsApp client',
        error: error.message,
      })
    }
  }
}
