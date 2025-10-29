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
import hash from '@adonisjs/core/services/hash';
import { compose } from '@adonisjs/core/helpers';
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { randomUUID } from 'crypto';
import DataSiswa from './data_siswa.js';
import DataGuru from './data_guru.js';
import DataStaf from './data_staf.js';
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
    uids: ['email'],
    passwordColumnName: 'password',
});
export default class User extends compose(BaseModel, AuthFinder) {
    static async generateUuid(user) {
        user.id = randomUUID();
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], User.prototype, "fullName", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    column({ serializeAs: null }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], User.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], User.prototype, "updatedAt", void 0);
__decorate([
    hasOne(() => DataSiswa),
    __metadata("design:type", Object)
], User.prototype, "dataSiswa", void 0);
__decorate([
    hasOne(() => DataGuru, {
        localKey: 'id',
        foreignKey: 'userId',
    }),
    __metadata("design:type", Object)
], User.prototype, "dataGuru", void 0);
__decorate([
    hasOne(() => DataStaf, {
        localKey: 'id',
        foreignKey: 'userId',
    }),
    __metadata("design:type", Object)
], User.prototype, "dataStaf", void 0);
__decorate([
    beforeCreate(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [User]),
    __metadata("design:returntype", Promise)
], User, "generateUuid", null);
//# sourceMappingURL=user.js.map