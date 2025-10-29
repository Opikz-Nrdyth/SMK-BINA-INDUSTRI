var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { DateTime } from 'luxon';
import { BaseModel, beforeCreate, beforeDelete, belongsTo, column } from '@adonisjs/lucid/orm';
import { randomUUID } from 'crypto';
import User from './user.js';
import FileUploadService from '#services/file_upload_service';
import encryption from '@adonisjs/core/services/encryption';
export default class Blog extends BaseModel {
    static async generateUuid(blog) {
        blog.id = randomUUID();
    }
    static async generateSlug(blog) {
        if (!blog.slug) {
            blog.slug = blog.judul
                .toLowerCase()
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
        }
    }
    static async deleteThumbnail(blog) {
        if (blog.thumbnail) {
            const fileService = new FileUploadService();
            await fileService.deleteFile(blog.thumbnail);
        }
    }
    get thumbnailUrl() {
        if (!this.thumbnail)
            return null;
        const fileService = new FileUploadService();
        return fileService.getFileUrl(this.thumbnail);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], Blog.prototype, "id", void 0);
__decorate([
    column({
        prepare: (value) => encryption.encrypt(value),
        consume: (value) => {
            if (!value)
                return null;
            return encryption.decrypt(value);
        },
    }),
    __metadata("design:type", String)
], Blog.prototype, "judul", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Blog.prototype, "slug", void 0);
__decorate([
    column({
        prepare: (value) => encryption.encrypt(value),
        consume: (value) => {
            if (!value)
                return null;
            return encryption.decrypt(value);
        },
    }),
    __metadata("design:type", String)
], Blog.prototype, "konten", void 0);
__decorate([
    column({
        prepare: (value) => encryption.encrypt(value),
        consume: (value) => {
            if (!value)
                return null;
            return encryption.decrypt(value);
        },
    }),
    __metadata("design:type", Object)
], Blog.prototype, "ringkasan", void 0);
__decorate([
    column({
        prepare: (value) => encryption.encrypt(value),
        consume: (value) => {
            if (!value)
                return null;
            return encryption.decrypt(value);
        },
    }),
    __metadata("design:type", Object)
], Blog.prototype, "thumbnail", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Blog.prototype, "status", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Blog.prototype, "kategori", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], Blog.prototype, "tags", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], Blog.prototype, "dilihat", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], Blog.prototype, "penulisId", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", Object)
], Blog.prototype, "publishedAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], Blog.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], Blog.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User, {
        foreignKey: 'penulisId',
    }),
    __metadata("design:type", Object)
], Blog.prototype, "penulis", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Blog]),
    __metadata("design:returntype", Promise)
], Blog, "generateUuid", null);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Blog]),
    __metadata("design:returntype", Promise)
], Blog, "generateSlug", null);
__decorate([
    beforeDelete(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Blog]),
    __metadata("design:returntype", Promise)
], Blog, "deleteThumbnail", null);
//# sourceMappingURL=blog.js.map