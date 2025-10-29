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
import User from './user.js';
import encryption from '@adonisjs/core/services/encryption';
export default class DataPembayaran extends BaseModel {
    static async generateUuid(pembayaran) {
        pembayaran.id = randomUUID();
    }
    getNominalBayarArray() {
        try {
            if (!this.nominalBayar) {
                return [];
            }
            const parsed = this.nominalBayar;
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            console.error('Error parsing nominalBayar JSON:', error);
            return [];
        }
    }
    getTotalDibayar() {
        const nominalArray = this.getNominalBayarArray();
        return nominalArray.reduce((total, item) => {
            const nominal = parseFloat(item.nominal || '0');
            return total + (isNaN(nominal) ? 0 : nominal);
        }, 0);
    }
    getSisaPembayaran() {
        const totalDibayar = this.getTotalDibayar();
        const penetapan = parseFloat(this.nominalPenetapan || '0');
        return penetapan - totalDibayar;
    }
    addPembayaran(nominal, tanggal) {
        const currentData = this.getNominalBayarArray();
        currentData.push({ nominal, tanggal });
        this.nominalBayar = JSON.stringify(currentData);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataPembayaran.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataPembayaran.prototype, "userId", void 0);
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
], DataPembayaran.prototype, "jenisPembayaran", void 0);
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
], DataPembayaran.prototype, "nominalPenetapan", void 0);
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
], DataPembayaran.prototype, "nominalBayar", void 0);
__decorate([
    column(),
    __metadata("design:type", Boolean)
], DataPembayaran.prototype, "partisipasiUjian", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataPembayaran.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataPembayaran.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], DataPembayaran.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataPembayaran]),
    __metadata("design:returntype", Promise)
], DataPembayaran, "generateUuid", null);
//# sourceMappingURL=data_pembayaran.js.map