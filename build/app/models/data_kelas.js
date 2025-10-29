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
import DataGuru from './data_guru.js';
export default class DataKelas extends BaseModel {
    static async generateUuid(kelas) {
        kelas.id = randomUUID();
    }
    getGuruAmpuArray() {
        try {
            return JSON.parse(this.guruPengampu || '[]');
        }
        catch {
            return [];
        }
    }
    setGuruAmpuArray(nips) {
        this.guruPengampu = JSON.stringify(nips);
    }
    getSiswaArray() {
        try {
            return JSON.parse(this.siswa || '[]');
        }
        catch {
            return [];
        }
    }
    setSiswaArray(nisn) {
        this.siswa = JSON.stringify(nisn);
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataKelas.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataKelas.prototype, "jenjang", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataKelas.prototype, "namaKelas", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataKelas.prototype, "waliKelas", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataKelas.prototype, "guruPengampu", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataKelas.prototype, "siswa", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataKelas.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataKelas.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => DataGuru, {
        foreignKey: 'waliKelas',
        localKey: 'nip',
    }),
    __metadata("design:type", Object)
], DataKelas.prototype, "guru", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataKelas]),
    __metadata("design:returntype", Promise)
], DataKelas, "generateUuid", null);
//# sourceMappingURL=data_kelas.js.map