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
export default class DataTahunAjaran extends BaseModel {
    static table = 'data_tahun_ajarans';
    static async generateUuid(tahunAjaran) {
        tahunAjaran.id = randomUUID();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataTahunAjaran.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataTahunAjaran.prototype, "kodeTa", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataTahunAjaran.prototype, "tahunAjaran", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataTahunAjaran.prototype, "kepalaSekolah", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataTahunAjaran.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataTahunAjaran.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User, {
        foreignKey: 'kepalaSekolah',
    }),
    __metadata("design:type", Object)
], DataTahunAjaran.prototype, "user", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataTahunAjaran]),
    __metadata("design:returntype", Promise)
], DataTahunAjaran, "generateUuid", null);
//# sourceMappingURL=data_tahun_ajaran.js.map