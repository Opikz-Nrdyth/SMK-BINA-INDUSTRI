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
import { BaseModel, beforeCreate, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm';
import { randomUUID } from 'crypto';
import encryption from '@adonisjs/core/services/encryption';
import DataMapel from './data_mapel.js';
export default class BankSoal extends BaseModel {
    static async generateUuid(bankSoal) {
        bankSoal.id = randomUUID();
    }
    static async encryptSoalFile(bankSoal) {
        if (bankSoal.$dirty.soalFile) {
            bankSoal.soalFile = encryption.encrypt(bankSoal.soalFile);
        }
    }
    decryptSoalFile() {
        return encryption.decrypt(this.soalFile);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], BankSoal.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "namaUjian", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "jenjang", void 0);
__decorate([
    column({
        prepare: (value) => JSON.stringify(value),
        consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
    }),
    __metadata("design:type", Array)
], BankSoal.prototype, "jurusan", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "kode", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "jenisUjian", void 0);
__decorate([
    column(),
    __metadata("design:type", Number)
], BankSoal.prototype, "mapelId", void 0);
__decorate([
    column({
        prepare: (value) => JSON.stringify(value),
        consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
    }),
    __metadata("design:type", Array)
], BankSoal.prototype, "penulis", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "waktu", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], BankSoal.prototype, "tanggalUjian", void 0);
__decorate([
    column({
        consume: (value) => encryption.decrypt(value),
    }),
    __metadata("design:type", String)
], BankSoal.prototype, "soalFile", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], BankSoal.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], BankSoal.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => DataMapel, {
        foreignKey: 'mapelId',
        localKey: 'id',
    }),
    __metadata("design:type", Object)
], BankSoal.prototype, "mapel", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BankSoal]),
    __metadata("design:returntype", Promise)
], BankSoal, "generateUuid", null);
__decorate([
    beforeSave(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BankSoal]),
    __metadata("design:returntype", Promise)
], BankSoal, "encryptSoalFile", null);
//# sourceMappingURL=bank_soal.js.map