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
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm';
import { randomUUID } from 'crypto';
export default class DataInformasi extends BaseModel {
    static async generateUuid(informasi) {
        informasi.id = randomUUID();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataInformasi.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataInformasi.prototype, "judul", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataInformasi.prototype, "deskripsi", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataInformasi.prototype, "roleTujuan", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataInformasi.prototype, "publishAt", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataInformasi.prototype, "closeAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataInformasi.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataInformasi.prototype, "updatedAt", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataInformasi]),
    __metadata("design:returntype", Promise)
], DataInformasi, "generateUuid", null);
//# sourceMappingURL=data_informasi.js.map