// app/services/file_upload_service.ts
import app from '@adonisjs/core/services/app'
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'
import fs from 'node:fs/promises'
import { cuid } from '@adonisjs/core/helpers'

export default class FileUploadService {
  private encryptionKey =
    process.env.FILE_ENCRYPTION_KEY || 'HQuimLAJCRyBz36AFJl5Djzr55gfeVmkqYofdYSxS7Q='
  private algorithm = 'aes-256-cbc'

  /**
   * Upload dan enkripsi file
   */
  async uploadAndEncrypt(file: any, folder: string = 'blogs') {
    // Generate nama file acak + ekstensi
    try {
      const originalExt = file.extname || '.jpg'
      const encryptedFileName = `${cuid()}${originalExt}`
      const filePath = app.makePath(`storage/${folder}`, encryptedFileName)

      // Baca file buffer
      const fileBuffer = await fs.readFile(file.tmpPath)

      // Enkripsi file
      const encryptedBuffer = await this.encryptBuffer(fileBuffer)

      // Simpan file terenkripsi
      await fs.writeFile(filePath, encryptedBuffer)

      // Hapus file temporary
      await fs.unlink(file.tmpPath)

      return encryptedFileName
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Decrypt dan baca file
   */
  async getDecryptedFile(fileName: string, folder: string = 'blogs'): Promise<Buffer> {
    const filePath = app.makePath(`storage/${folder}`, fileName)

    try {
      const encryptedBuffer = await fs.readFile(filePath)
      return await this.decryptBuffer(encryptedBuffer)
    } catch (error) {
      throw new Error(`File not found: ${fileName}`)
    }
  }

  /**
   * Hapus file
   */
  async deleteFile(fileName: string, folder: string = 'blogs'): Promise<void> {
    const filePath = app.makePath(`storage/${folder}`, fileName)

    try {
      await fs.unlink(filePath)
    } catch (error) {
      console.warn(`File not found for deletion: ${fileName}`)
    }
  }

  /**
   * Encrypt buffer
   */
  private async encryptBuffer(buffer: Buffer): Promise<Buffer> {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'base64'), iv)

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
    return Buffer.concat([iv, encrypted])
  }

  /**
   * Decrypt buffer
   */
  private async decryptBuffer(encryptedBuffer: Buffer): Promise<Buffer> {
    const iv = encryptedBuffer.slice(0, 16)
    const encryptedData = encryptedBuffer.slice(16)

    const decipher = createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'base64'), iv)

    return Buffer.concat([decipher.update(encryptedData), decipher.final()])
  }

  /**
   * Get URL untuk akses file (via route)
   */
  getFileUrl(fileName: string): string {
    return `/uploads/blogs/${fileName}`
  }
}
