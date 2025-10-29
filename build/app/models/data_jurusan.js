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
export default class DataJurusan extends BaseModel {
    static async generateUuid(jurusan) {
        jurusan.id = randomUUID();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataJurusan.prototype, "id", void 0);
__decorate([
    column({
        prepare: (value) => JSON.stringify(value),
        consume: (value) => (typeof value === 'string' ? JSON.parse(value) : value),
    }),
    __metadata("design:type", Array)
], DataJurusan.prototype, "kelasId", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataJurusan.prototype, "kodeJurusan", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataJurusan.prototype, "namaJurusan", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataJurusan.prototype, "akreditasi", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataJurusan.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataJurusan.prototype, "updatedAt", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DataJurusan]),
    __metadata("design:returntype", Promise)
], DataJurusan, "generateUuid", null);
//# sourceMappingURL=data_jurusan.js.map