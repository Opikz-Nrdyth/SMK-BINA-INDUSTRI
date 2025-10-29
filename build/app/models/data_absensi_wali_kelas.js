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
import DataKelas from './data_kelas.js';
export default class DataAbsensiWaliKelas extends BaseModel {
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], DataAbsensiWaliKelas.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAbsensiWaliKelas.prototype, "userId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAbsensiWaliKelas.prototype, "kelasId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataAbsensiWaliKelas.prototype, "status", void 0);
__decorate([
    column.dateTime(),
    __metadata("design:type", DateTime)
], DataAbsensiWaliKelas.prototype, "hari", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataAbsensiWaliKelas.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataAbsensiWaliKelas.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], DataAbsensiWaliKelas.prototype, "user", void 0);
__decorate([
    belongsTo(() => DataKelas, {
        foreignKey: 'kelasId',
    }),
    __metadata("design:type", Object)
], DataAbsensiWaliKelas.prototype, "kelas", void 0);
//# sourceMappingURL=data_absensi_wali_kelas.js.map