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
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm';
import { randomUUID } from 'crypto';
import DataSiswa from './data_siswa.js';
import encryption from '@adonisjs/core/services/encryption';
export default class DataWali extends BaseModel {
    static async generateUuid(dataWali) {
        dataWali.id = randomUUID();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataWali.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataWali.prototype, "nisn", void 0);
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
], DataWali.prototype, "nik", void 0);
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
], DataWali.prototype, "nama", void 0);
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
], DataWali.prototype, "tanggalLahir", void 0);
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
], DataWali.prototype, "pendidikan", void 0);
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
], DataWali.prototype, "pekerjaan", void 0);
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
], DataWali.prototype, "penghasilan", void 0);
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
], DataWali.prototype, "noHp", void 0);
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
], DataWali.prototype, "hubungan", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataWali.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataWali.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => DataSiswa, {
        foreignKey: 'nisn',
    }),
    __metadata("design:type", Object)
], DataWali.prototype, "dataSiswa", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataWali]),
    __metadata("design:returntype", Promise)
], DataWali, "generateUuid", null);
//# sourceMappingURL=data_wali.js.map