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
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm';
import User from './user.js';
import encryption from '@adonisjs/core/services/encryption';
export default class DataAktivita extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataAktivita.prototype, "id", void 0);
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
], DataAktivita.prototype, "nama", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAktivita.prototype, "jenis", void 0);
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
], DataAktivita.prototype, "deskripsi", void 0);
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
], DataAktivita.prototype, "lokasi", void 0);
__decorate([
    column({
        prepare: (value) => encryption.encrypt(value),
        consume: (value) => {
            if (!value)
                return null;
            return encryption.decrypt(value);
        },
    }),
    __metadata("design:type", Date)
], DataAktivita.prototype, "tanggalPelaksanaan", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAktivita.prototype, "status", void 0);
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
], DataAktivita.prototype, "dokumentasi", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataAktivita.prototype, "createdBy", void 0);
__decorate([
    belongsTo(() => User, { foreignKey: 'createdBy' }),
    __metadata("design:type", Object)
], DataAktivita.prototype, "pembuat", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataAktivita.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataAktivita.prototype, "updatedAt", void 0);
//# sourceMappingURL=data_aktivitas.js.map