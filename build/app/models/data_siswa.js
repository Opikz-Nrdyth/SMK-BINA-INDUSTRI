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
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm';
import User from './user.js';
import DataWali from './data_wali.js';
import encryption from '@adonisjs/core/services/encryption';
export default class DataSiswa extends BaseModel {
    static primaryKey = 'nisn';
    static incrementing = false;
}
__decorate([
    column({ isPrimary: true }),
    __metadata("design:type", String)
], DataSiswa.prototype, "nisn", void 0);
__decorate([
    column(),
    __metadata("design:type", String)
], DataSiswa.prototype, "userId", void 0);
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
], DataSiswa.prototype, "jenisKelamin", void 0);
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
], DataSiswa.prototype, "nik", void 0);
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
], DataSiswa.prototype, "noKk", void 0);
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
], DataSiswa.prototype, "tempatLahir", void 0);
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
], DataSiswa.prototype, "tanggalLahir", void 0);
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
], DataSiswa.prototype, "noAktaLahir", void 0);
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
], DataSiswa.prototype, "agama", void 0);
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
], DataSiswa.prototype, "kewarganegaraan", void 0);
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
], DataSiswa.prototype, "alamat", void 0);
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
], DataSiswa.prototype, "rt", void 0);
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
], DataSiswa.prototype, "rw", void 0);
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
], DataSiswa.prototype, "dusun", void 0);
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
], DataSiswa.prototype, "kelurahan", void 0);
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
], DataSiswa.prototype, "kecamatan", void 0);
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
], DataSiswa.prototype, "kodePos", void 0);
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
], DataSiswa.prototype, "jenisTinggal", void 0);
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
], DataSiswa.prototype, "transportasi", void 0);
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
], DataSiswa.prototype, "anakKe", void 0);
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
], DataSiswa.prototype, "jumlahSaudara", void 0);
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
], DataSiswa.prototype, "penerimaKip", void 0);
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
], DataSiswa.prototype, "noTelepon", void 0);
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
], DataSiswa.prototype, "beratBadan", void 0);
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
], DataSiswa.prototype, "tinggiBadan", void 0);
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
], DataSiswa.prototype, "lingkarKepala", void 0);
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
], DataSiswa.prototype, "jarakSekolah", void 0);
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
], DataSiswa.prototype, "waktuTempuh", void 0);
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
], DataSiswa.prototype, "jenisKesejahteraan", void 0);
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
], DataSiswa.prototype, "nomorKartu", void 0);
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
], DataSiswa.prototype, "namaDiKartu", void 0);
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
], DataSiswa.prototype, "jenisPendaftaran", void 0);
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
], DataSiswa.prototype, "sekolahAsal", void 0);
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
], DataSiswa.prototype, "npsn", void 0);
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
], DataSiswa.prototype, "sekolahAsalPindahan", void 0);
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
], DataSiswa.prototype, "suratKeteranganPindah", void 0);
__decorate([
    column(),
    __metadata("design:type", Object)
], DataSiswa.prototype, "status", void 0);
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
], DataSiswa.prototype, "fileAkta", void 0);
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
], DataSiswa.prototype, "fileKk", void 0);
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
], DataSiswa.prototype, "fileIjazah", void 0);
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
], DataSiswa.prototype, "hobby", void 0);
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
], DataSiswa.prototype, "citacita", void 0);
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
], DataSiswa.prototype, "noKps", void 0);
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
], DataSiswa.prototype, "fileFoto", void 0);
__decorate([
    column.dateTime({ autoCreate: true }),
    __metadata("design:type", DateTime)
], DataSiswa.prototype, "createdAt", void 0);
__decorate([
    column.dateTime({ autoCreate: true, autoUpdate: true }),
    __metadata("design:type", Object)
], DataSiswa.prototype, "updatedAt", void 0);
__decorate([
    belongsTo(() => User),
    __metadata("design:type", Object)
], DataSiswa.prototype, "user", void 0);
__decorate([
    hasMany(() => DataWali, {
        foreignKey: 'nisn',
    }),
    __metadata("design:type", Object)
], DataSiswa.prototype, "dataWalis", void 0);
//# sourceMappingURL=data_siswa.js.map