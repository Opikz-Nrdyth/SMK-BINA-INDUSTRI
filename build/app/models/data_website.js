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
import { BaseModel, column } from '@adonisjs/lucid/orm';
import encryption from '@adonisjs/core/services/encryption';
export default class DataWebsite extends BaseModel {
    static async getAllSettings() {
        const settings = await this.all();
        const result = {};
        settings.forEach((setting) => {
            result[setting.name] = setting.value;
        });
        return result;
    }
    static async updateSetting(name, value) {
        let setting = await this.findBy('name', name);
        if (setting) {
            setting.value = value;
            await setting.save();
        }
        else {
            setting = await this.create({ name, value });
        }
        return setting;
    }
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", Number)
], DataWebsite.prototype, "id", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataWebsite.prototype, "name", void 0);
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
], DataWebsite.prototype, "value", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataWebsite.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", DateTime)
], DataWebsite.prototype, "updatedAt", void 0);
//# sourceMappingURL=data_website.js.map