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
import { BaseModel, column } from '@adonisjs/lucid/orm';
import encryption from '@adonisjs/core/services/encryption';
export default class DataAds extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataAds.prototype, "id", void 0);
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
], DataAds.prototype, "judul", void 0);
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
], DataAds.prototype, "deskripsi", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAds.prototype, "tipe", void 0);
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
], DataAds.prototype, "gambar", void 0);
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
], DataAds.prototype, "tautan", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], DataAds.prototype, "aktif", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataAds.prototype, "tanggalMulai", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataAds.prototype, "tanggalSelesai", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataAds.prototype, "createdBy", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataAds.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataAds.prototype, "updatedAt", void 0);
//# sourceMappingURL=data_ads.js.map