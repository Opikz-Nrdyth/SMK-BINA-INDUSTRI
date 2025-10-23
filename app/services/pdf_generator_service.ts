import PDFDocument from 'pdfkit'
import { DateTime } from 'luxon'

export class PdfGeneratorService {
  private doc: any
  private isEnded: boolean

  constructor() {
    this.doc = null
    this.isEnded = false
  }

  /**
   * Create new PDF document
   */
  createDocument(paperSize: string = 'A4', customWidth?: number, customHeight?: number) {
    const sizes = this.getPaperSize(paperSize, customWidth, customHeight)

    this.doc = new PDFDocument({
      size: [sizes.width, sizes.height],
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
      info: {
        Title: 'Invoice Pembayaran',
        Author: 'Sistem Sekolah',
        Creator: 'Sistem Sekolah',
        CreationDate: new Date(),
      },
    })

    this.isEnded = false

    // Handle stream events
    this.doc.on('end', () => {
      this.isEnded = true
    })

    this.doc.on('error', (error: Error) => {
      console.error('PDF Generation Error:', error)
      this.isEnded = true
    })

    return this
  }

  /**
   * Get paper size in points (1 cm = 28.35 points)
   */
  private getPaperSize(paperSize: string, customWidth?: number, customHeight?: number) {
    const sizes: any = {
      A4: { width: 595.28, height: 841.89 }, // 21.0 x 29.7 cm
      A5: { width: 419.53, height: 595.28 }, // 14.8 x 21.0 cm
      A6: { width: 297.64, height: 419.53 }, // 10.5 x 14.8 cm
      custom: {
        width: customWidth ? customWidth * 28.35 : 595.28,
        height: customHeight ? customHeight * 28.35 : 841.89,
      },
    }

    return sizes[paperSize] || sizes.A4
  }

  /**
   * Generate invoice content
   */
  generateInvoice(invoiceData: any) {
    if (!this.doc) {
      throw new Error('PDF document not initialized. Call createDocument() first.')
    }

    if (this.isEnded) {
      throw new Error('PDF document has already been ended.')
    }

    try {
      this.addHeader()
      this.addInvoiceInfo(invoiceData)
      this.addPaymentDetails(invoiceData)
      this.addFooter()
    } catch (error) {
      console.error('Error generating invoice content:', error)
      throw error
    }

    return this
  }

  /**
   * Add header with school information
   */
  private addHeader() {
    const doc = this.doc

    // School logo placeholder (you can replace with actual image)
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('SEKOLAH MENENGAH KEJURUAN BINA INDUSTRI', 50, 50, { align: 'center' })

    doc
      .fontSize(10)
      .font('Helvetica')
      .text('Jl. Industri No. 123, Jakarta Selatan', 50, 70, { align: 'center' })
      .text('Telp: (021) 1234567 | Email: info@smk-bina-industri.sch.id', 50, 85, {
        align: 'center',
      })

    // Separator line
    doc
      .moveTo(50, 110)
      .lineTo(doc.page.width - 50, 110)
      .stroke()

    // Invoice title
    doc.fontSize(18).font('Helvetica-Bold').text('INVOICE PEMBAYARAN', 50, 120, { align: 'center' })
  }

  /**
   * Add invoice information
   */
  private addInvoiceInfo(invoiceData: any) {
    const doc = this.doc
    let currentY = 160

    doc.fontSize(9).font('Helvetica')

    // Left column - Student info
    doc
      .text('Nomor Invoice:', 50, currentY)
      .font('Helvetica-Bold')
      .text(invoiceData.nomorInvoice, 130, currentY)

    currentY += 15
    doc
      .font('Helvetica')
      .text('Tanggal Cetak:', 50, currentY)
      .text(invoiceData.tanggalCetak, 130, currentY)

    currentY += 15
    doc
      .text('Nama Siswa:', 50, currentY)
      .font('Helvetica-Bold')
      .text(invoiceData.siswa, 130, currentY)

    currentY += 15
    doc
      .font('Helvetica')
      .text('NISN:', 50, currentY)
      .text(invoiceData.nisn || '-', 130, currentY)

    // Right column - Payment info
    currentY = 160
    const rightColumnX = 300

    doc
      .text('Jenis Pembayaran:', rightColumnX, currentY)
      .font('Helvetica-Bold')
      .text(invoiceData.jenisPembayaran, rightColumnX + 100, currentY)

    currentY += 15
    doc
      .font('Helvetica')
      .text('Status:', rightColumnX, currentY)
      .font('Helvetica-Bold')
      .text(invoiceData.lunas ? 'LUNAS' : 'BELUM LUNAS', rightColumnX + 100, currentY, {
        color: invoiceData.lunas ? 'green' : 'red',
      })
  }

  /**
   * Add payment details table
   */
  private addPaymentDetails(invoiceData: any) {
    const doc = this.doc
    let currentY = 230

    doc.fontSize(11).font('Helvetica-Bold').text('RINCIAN PEMBAYARAN', 50, currentY)

    currentY += 20

    // Table headers
    const headers = [
      { text: 'No', x: 50, width: 30 },
      { text: 'Keterangan', x: 80, width: 250 },
      { text: 'Nominal', x: 330, width: 100 },
      { text: 'Status', x: 430, width: 80 },
    ]

    doc.fontSize(8)
    headers.forEach((header) => {
      doc.text(header.text, header.x, currentY)
    })

    currentY += 15

    // Header line
    doc
      .moveTo(50, currentY)
      .lineTo(doc.page.width - 50, currentY)
      .stroke()

    currentY += 10

    // Penetapan row
    doc
      .fontSize(8)
      .font('Helvetica')
      .text('1', 50, currentY)
      .text('Penetapan Biaya', 80, currentY)
      .text(this.formatRupiah(parseFloat(invoiceData.nominalPenetapan)), 330, currentY, {
        align: 'right',
      })
      .text('WAJIB', 430, currentY, { align: 'center' })

    currentY += 12

    // Payment history rows
    invoiceData.riwayatPembayaran.forEach((item: any, index: number) => {
      // Check if we need a new page
      if (currentY > doc.page.height - 100) {
        doc.addPage()
        currentY = 50
      }

      const rowNumber = (index + 2).toString()
      const description = `Pembayaran ${index + 1} - ${DateTime.fromISO(item.tanggal).toFormat('dd/MM/yyyy')}`

      doc
        .text(rowNumber, 50, currentY)
        .text(description, 80, currentY)
        .text(this.formatRupiah(parseFloat(item.nominal)), 330, currentY, { align: 'right' })
        .text('DIBAYAR', 430, currentY, { align: 'center' })

      currentY += 12
    })

    currentY += 10

    // Summary
    const summaryY = currentY
    doc
      .moveTo(300, summaryY)
      .lineTo(doc.page.width - 50, summaryY)
      .stroke()

    currentY += 15

    doc
      .font('Helvetica-Bold')
      .text('Total Dibayar:', 300, currentY)
      .text(this.formatRupiah(invoiceData.totalDibayar), 430, currentY, { align: 'right' })

    currentY += 12

    doc
      .text('Sisa Pembayaran:', 300, currentY)
      .text(this.formatRupiah(invoiceData.sisaPembayaran), 430, currentY, {
        align: 'right',
        color: invoiceData.sisaPembayaran > 0 ? 'red' : 'green',
      })
  }

  /**
   * Add footer
   */
  private addFooter() {
    const doc = this.doc

    // Only add footer if there's enough space
    if (doc.y < doc.page.height - 80) {
      const footerY = doc.page.height - 80

      doc
        .fontSize(8)
        .font('Helvetica')
        .text('Terima kasih atas pembayaran Anda.', 50, footerY, { align: 'center' })
        .text('Invoice ini sah dan dapat digunakan sebagai bukti pembayaran.', 50, footerY + 12, {
          align: 'center',
        })

      // Signature
      const signatureY = doc.page.height - 50
      doc
        .text('Hormat Kami,', doc.page.width - 150, signatureY, { align: 'center' })
        .text('Bendahara Sekolah', doc.page.width - 150, signatureY + 20, { align: 'center' })
    }
  }

  /**
   * Format currency to Rupiah
   */
  private formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  /**
   * Get PDF as buffer
   */
  async getBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.doc) {
        reject(new Error('PDF document not initialized'))
        return
      }

      if (this.isEnded) {
        reject(new Error('PDF document has already been ended'))
        return
      }

      const chunks: Buffer[] = []

      this.doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      this.doc.on('end', () => {
        this.isEnded = true
        resolve(Buffer.concat(chunks))
      })

      this.doc.on('error', (error: Error) => {
        this.isEnded = true
        reject(error)
      })

      this.doc.end()
    })
  }

  /**
   * Pipe PDF to response - FIXED VERSION
   */
  pipeToResponse(response: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.doc) {
        reject(new Error('PDF document not initialized'))
        return
      }

      if (this.isEnded) {
        reject(new Error('PDF document has already been ended'))
        return
      }

      // Handle response events
      response.response.on('finish', () => {
        this.isEnded = true
        resolve()
      })

      response.response.on('error', (error: Error) => {
        this.isEnded = true
        reject(error)
      })

      // Pipe document to response
      try {
        this.doc.pipe(response.response)
        this.doc.end()
      } catch (error) {
        this.isEnded = true
        reject(error)
      }
    })
  }

  /**
   * Safely destroy the document
   */
  destroy() {
    if (this.doc && !this.isEnded) {
      try {
        this.doc.end()
      } catch (error) {
        // Ignore errors during destruction
      }
      this.isEnded = true
    }
  }
}
