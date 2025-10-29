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
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm';
import User from './user.js';
import DataKelas from './data_kelas.js';
import DataMapel from './data_mapel.js';
import encryption from '@adonisjs/core/services/encryption';
export default class DataGuru extends BaseModel {
    static primaryKey = 'nip';
    static incrementing = false;
    async mapelAmpu() {
        const semuaMapel = await DataMapel.all();
        return semuaMapel.filter((mapel) => mapel.getGuruAmpuArray().includes(this.nip));
    }
    async mapelAmpuGuru() {
        return await DataMapel.query().whereRaw('JSON_CONTAINS(guru_ampu, JSON_QUOTE(?))', [this.nip]);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataGuru.prototype, "nip", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataGuru.prototype, "userId", void 0);
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
], DataGuru.prototype, "alamat", void 0);
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
], DataGuru.prototype, "noTelepon", void 0);
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
], DataGuru.prototype, "gelarDepan", void 0);
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
], DataGuru.prototype, "gelarBelakang", void 0);
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
], DataGuru.prototype, "jenisKelamin", void 0);
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
], DataGuru.prototype, "tempatLahir", void 0);
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
], DataGuru.prototype, "tanggalLahir", void 0);
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
], DataGuru.prototype, "agama", void 0);
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
], DataGuru.prototype, "fileFoto", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataGuru.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataGuru.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], DataGuru.prototype, "user", void 0);
__decorate([
    hasOne(() => DataKelas, {
        foreignKey: 'waliKelas',
        localKey: 'nip',
    }),
    __metadata("design:type", Object)
], DataGuru.prototype, "waliKelas", void 0);
__decorate([
    hasMany(() => DataMapel, {
        foreignKey: 'guruAmpu',
        localKey: 'nip',
    }),
    __metadata("design:type", Object)
], DataGuru.prototype, "mapel", void 0);
//# sourceMappingURL=data_guru.js.map