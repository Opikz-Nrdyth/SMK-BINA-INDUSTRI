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
import { BaseModel, beforeCreate, beforeSave, column, belongsTo } from '@adonisjs/lucid/orm';
import { randomUUID } from 'crypto';
import encryption from '@adonisjs/core/services/encryption';
import User from './user.js';
import BankSoal from './bank_soal.js';
export default class ManajemenKehadiran extends BaseModel {
    static async generateUuid(kehadiran) {
        kehadiran.id = randomUUID();
    }
    static async encryptJawabanFile(kehadiran) {
        if (kehadiran.$dirty.jawabanFile) {
            kehadiran.jawabanFile = encryption.encrypt(kehadiran.jawabanFile);
        }
    }
    decryptJawabanFile() {
        return encryption.decrypt(this.jawabanFile);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], ManajemenKehadiran.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ManajemenKehadiran.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], ManajemenKehadiran.prototype, "ujianId", void 0);
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
], ManajemenKehadiran.prototype, "skor", void 0);
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
], ManajemenKehadiran.prototype, "benar", void 0);
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
], ManajemenKehadiran.prototype, "salah", void 0);
__decorate([
    column({
        consume: (value) => encryption.decrypt(value),
    }),
    __metadata("design:type", String)
], ManajemenKehadiran.prototype, "jawabanFile", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], ManajemenKehadiran.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], ManajemenKehadiran.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], ManajemenKehadiran.prototype, "user", void 0);
__decorate([
    belongsTo(() => BankSoal, {
        foreignKey: 'ujianId',
    }),
    __metadata("design:type", Object)
], ManajemenKehadiran.prototype, "ujian", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ManajemenKehadiran]),
    __metadata("design:returntype", Promise)
], ManajemenKehadiran, "generateUuid", null);
__decorate([
    beforeSave(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [ManajemenKehadiran]),
    __metadata("design:returntype", Promise)
], ManajemenKehadiran, "encryptJawabanFile", null);
//# sourceMappingURL=manajemen_kehadiran.js.map