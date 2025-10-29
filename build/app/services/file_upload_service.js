import app from '@adonisjs/core/services/app';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import fs from 'node:fs/promises';
import { cuid } from '@adonisjs/core/helpers';
export default class FileUploadService {
    encryptionKey = process.env.FILE_ENCRYPTION_KEY || 'HQuimLAJCRyBz36AFJl5Djzr55gfeVmkqYofdYSxS7Q=';
    algorithm = 'aes-256-cbc';
    async uploadAndEncrypt(file, folder = 'blogs') {
        try {
            const originalExt = file.extname || '.jpg';
            const encryptedFileName = `${cuid()}${originalExt}`;
            const filePath = app.makePath(`storage/${folder}`, encryptedFileName);
            const fileBuffer = await fs.readFile(file.tmpPath);
            const encryptedBuffer = await this.encryptBuffer(fileBuffer);
            await fs.writeFile(filePath, encryptedBuffer);
            await fs.unlink(file.tmpPath);
            return encryptedFileName;
        }
        catch (error) {
            console.log(error);
        }
    }
    async getDecryptedFile(fileName, folder = 'blogs') {
        const filePath = app.makePath(`storage/${folder}`, fileName);
        try {
            const encryptedBuffer = await fs.readFile(filePath);
            return await this.decryptBuffer(encryptedBuffer);
        }
        catch (error) {
            throw new Error(`File not found: ${fileName}`);
        }
    }
    async deleteFile(fileName, folder = 'blogs') {
        const filePath = app.makePath(`storage/${folder}`, fileName);
        try {
            await fs.unlink(filePath);
        }
        catch (error) {
            console.warn(`File not found for deletion: ${fileName}`);
        }
    }
    async encryptBuffer(buffer) {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'base64'), iv);
        const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
        return Buffer.concat([iv, encrypted]);
    }
    async decryptBuffer(encryptedBuffer) {
        const iv = encryptedBuffer.slice(0, 16);
        const encryptedData = encryptedBuffer.slice(16);
        const decipher = createDecipheriv(this.algorithm, Buffer.from(this.encryptionKey, 'base64'), iv);
        return Buffer.concat([decipher.update(encryptedData), decipher.final()]);
    }
    getFileUrl(fileName) {
        return `/uploads/blogs/${fileName}`;
    }
}
//# sourceMappingURL=file_upload_service.js.map