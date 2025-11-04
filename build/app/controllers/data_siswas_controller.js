import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';
import DataSiswa from '#models/data_siswa';
import { userSiswaValidator } from '#validators/data_siswa';
import User from '#models/user';
import DataWali from '#models/data_wali';
import DataKelas from '#models/data_kelas';
import app from '@adonisjs/core/services/app';
import DataJurusan from '#models/data_jurusan';
import { ppdbValidator } from '#validators/ppdb';
import { join } from 'path';
import fs from 'fs/promises';
import ExcelJS from 'exceljs';
import DataGuru from '#models/data_guru';
import DataWebsite from '#models/data_website';
import DataTahunAjaran from '#models/data_tahun_ajaran';
export default class DataSiswasController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const semuaKelas = await DataKelas.all();
        const mapNisnToKelas = new Map();
        for (const kelas of semuaKelas) {
            const siswaArray = typeof kelas.siswa === 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa;
            siswaArray.forEach((nisn) => {
                mapNisnToKelas.set(nisn, kelas.namaKelas);
            });
        }
        const [totalSiswa] = await Promise.all([
            DataSiswa.query().where('status', 'siswa').count('* as total').first(),
        ]);
        const query = DataSiswa.query()
            .where('status', 'siswa')
            .preload('user', (user) => user.orderBy('full_name', 'asc'))
            .preload('dataWalis');
        if (search) {
            query.where((builder) => {
                builder
                    .where('nisn', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
                    .orWhere('sekolah_asal', 'LIKE', `%${search}%`);
            });
        }
        const perPage = search ? Number(totalSiswa?.$extras.total) || 1 : 15;
        const startNumber = (page - 1) * perPage + 1;
        const siswaPaginate = await query.paginate(page, search ? Number(totalSiswa?.$extras.total) || 1 : 15);
        const siswas = siswaPaginate.all().map((siswa, index) => {
            const raw = siswa.toJSON();
            const namaKelas = mapNisnToKelas.get(siswa.nisn) || '-';
            const sorted = {};
            sorted.nomor = startNumber + index;
            if (raw.user)
                sorted.user = raw.user;
            sorted.nama_kelas = namaKelas;
            for (const [key, value] of Object.entries(raw)) {
                if (typeof value === 'string' && key !== 'userId') {
                    sorted[key] = value;
                }
            }
            for (const [key, value] of Object.entries(raw)) {
                if (typeof value !== 'string' && key !== 'user') {
                    sorted[key] = value;
                }
            }
            return sorted;
        });
        return inertia.render('Siswa/Index', {
            siswaPaginate: {
                currentPage: siswaPaginate.currentPage,
                lastPage: siswaPaginate.lastPage,
                total: siswaPaginate.total,
                perPage: siswaPaginate.perPage,
                firstPage: 1,
                nextPage: siswaPaginate.currentPage < siswaPaginate.lastPage ? siswaPaginate.currentPage + 1 : null,
                previousPage: siswaPaginate.currentPage > 1 ? siswaPaginate.currentPage - 1 : null,
            },
            siswas: siswas,
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async indexPerKelas({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const selectedKelas = request.input('kelas', '');
        const semuaKelas = await DataKelas.query();
        const waliKelasNipList = semuaKelas
            .map((kelas) => kelas.waliKelas)
            .filter((nip) => nip)
            .filter((v, i, a) => a.indexOf(v) === i);
        const waliGuruList = await DataGuru.query().whereIn('nip', waliKelasNipList).preload('user');
        const waliMap = new Map(waliGuruList.map((guru) => [guru.nip, guru.user.fullName]));
        const nisnMap = new Map();
        const kelasMap = new Map();
        semuaKelas.forEach((kelas) => {
            const siswaArray = typeof kelas.siswa === 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa;
            kelasMap.set(kelas.namaKelas, {
                namaKelas: kelas.namaKelas,
                jumlahSiswa: siswaArray.length,
                waliKelas: waliMap.get(kelas.waliKelas) || '-',
            });
            siswaArray.forEach((nisn) => nisnMap.set(nisn, kelas.namaKelas));
        });
        let query = DataSiswa.query()
            .where('status', 'siswa')
            .preload('user', (user) => user.orderBy('full_name', 'asc'))
            .preload('dataWalis');
        if (selectedKelas) {
            const nisnInKelas = Array.from(nisnMap.entries())
                .filter(([_, namaKelas]) => namaKelas === selectedKelas)
                .map(([nisn]) => nisn);
            query = query.whereIn('nisn', nisnInKelas);
        }
        if (search) {
            query = query.where((builder) => {
                builder
                    .where('nisn', 'LIKE', `%${search}%`)
                    .orWhere('nik', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
                    .orWhere('alamat', 'LIKE', `%${search}%`);
            });
        }
        const perPage = 15;
        const siswaPaginate = await query.paginate(page, perPage);
        const startNumber = (page - 1) * perPage + 1;
        const siswasWithKelas = siswaPaginate.all().map((siswa, index) => {
            const siswaData = siswa.toJSON();
            siswaData.nama_kelas = nisnMap.get(siswa.nisn) || '-';
            siswaData.nomor_absen = startNumber + index;
            return siswaData;
        });
        return inertia.render('Siswa/SiswaPerKelas', {
            siswaPaginate: {
                currentPage: siswaPaginate.currentPage,
                lastPage: siswaPaginate.lastPage,
                total: siswaPaginate.total,
                perPage: siswaPaginate.perPage,
                firstPage: 1,
                nextPage: siswaPaginate.currentPage < siswaPaginate.lastPage ? siswaPaginate.currentPage + 1 : null,
                previousPage: siswaPaginate.currentPage > 1 ? siswaPaginate.currentPage - 1 : null,
            },
            siswas: siswasWithKelas,
            kelasList: Array.from(kelasMap.values()),
            selectedKelas,
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async indexGuru({ request, inertia, session, auth }) {
        await auth.check();
        const user = auth.user;
        await user.load('dataGuru');
        const nip = user.dataGuru.nip;
        const dataKelasDiampu = await DataKelas.query().whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [
            `"${nip}"`,
        ]);
        const dataKelasWali = await DataKelas.query().where('waliKelas', nip);
        const nisnDiampu = new Map();
        const kelasMap = new Map();
        dataKelasDiampu.forEach((kelas) => {
            const siswaArray = typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa;
            if (!kelasMap.has(kelas.namaKelas)) {
                kelasMap.set(kelas.namaKelas, {
                    namaKelas: kelas.namaKelas,
                    jumlahSiswa: 0,
                    jenisKelas: 'diampu',
                    isWaliKelas: false,
                });
            }
            siswaArray.forEach((nisn) => {
                nisnDiampu.set(nisn, {
                    namaKelas: kelas.namaKelas,
                    jenisKelas: 'diampu',
                });
                const kelasData = kelasMap.get(kelas.namaKelas);
                kelasData.jumlahSiswa++;
            });
        });
        dataKelasWali.forEach((kelas) => {
            const siswaArray = typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa;
            console.log(siswaArray);
            if (kelasMap.has(kelas.namaKelas)) {
                const kelasData = kelasMap.get(kelas.namaKelas);
                kelasData.jenisKelas = 'diampu';
                kelasData.isWaliKelas = true;
            }
            else {
                kelasMap.set(kelas.namaKelas, {
                    namaKelas: kelas.namaKelas,
                    jumlahSiswa: 0,
                    jenisKelas: 'wali',
                    isWaliKelas: true,
                });
            }
            siswaArray.forEach((nisn) => {
                if (!nisnDiampu.has(nisn)) {
                    nisnDiampu.set(nisn, {
                        namaKelas: kelas.namaKelas,
                        jenisKelas: 'wali',
                    });
                    const kelasData = kelasMap.get(kelas.namaKelas);
                    kelasData.jumlahSiswa++;
                }
            });
        });
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const selectedKelas = request.input('kelas', '');
        let query = DataSiswa.query()
            .preload('user', (user) => user.orderBy('full_name', 'asc'))
            .where('status', 'siswa')
            .preload('dataWalis')
            .whereIn('nisn', Array.from(nisnDiampu.keys()));
        if (selectedKelas) {
            const nisnInKelas = Array.from(nisnDiampu.entries())
                .filter(([nisn, data]) => nisn && data.namaKelas === selectedKelas)
                .map(([nisn]) => nisn);
            query = query.whereIn('nisn', nisnInKelas);
        }
        if (search) {
            query = query.where((builder) => {
                builder
                    .where('nisn', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`);
            });
        }
        const perPage = 15;
        const siswaPaginate = await query.paginate(page, perPage);
        const startNumber = (page - 1) * perPage + 1;
        const siswasWithKelas = siswaPaginate.all().map((siswa, index) => {
            const siswaData = siswa.toJSON();
            const kelasInfo = nisnDiampu.get(siswa.nisn) || {
                namaKelas: '-',
                jenisKelas: 'diampu',
            };
            siswaData.nama_kelas = kelasInfo.namaKelas;
            siswaData.jenis_kelas = kelasInfo.jenisKelas;
            siswaData.nomor_absen = startNumber + index;
            return siswaData;
        });
        const kelasList = Array.from(kelasMap.values());
        return inertia.render('Siswa/IndexGuru', {
            siswaPaginate: {
                currentPage: siswaPaginate.currentPage,
                lastPage: siswaPaginate.lastPage,
                total: siswaPaginate.total,
                perPage: siswaPaginate.perPage,
                firstPage: 1,
                nextPage: siswaPaginate.currentPage < siswaPaginate.lastPage ? siswaPaginate.currentPage + 1 : null,
                previousPage: siswaPaginate.currentPage > 1 ? siswaPaginate.currentPage - 1 : null,
            },
            siswas: siswasWithKelas,
            kelasList,
            selectedKelas,
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async create({ inertia, session }) {
        return inertia.render('Siswa/Create', {
            session: session.flashMessages.all(),
        });
    }
    async store({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(userSiswaValidator);
            const fileAktaPath = request.file('siswa.fileAkta')
                ? await this.uploadFile(request.file('siswa.fileAkta'), String(payload.siswa.nisn), 'akta')
                : null;
            const fileKkPath = request.file('siswa.fileKk')
                ? await this.uploadFile(request.file('siswa.fileKk'), String(payload.siswa.nisn), 'kk')
                : null;
            const fileIjazahPath = request.file('siswa.fileIjazah')
                ? await this.uploadFile(request.file('siswa.fileIjazah'), String(payload.siswa.nisn), 'ijazah')
                : null;
            const fileFotoPath = request.file('siswa.fileFoto')
                ? await this.uploadFile(request.file('siswa.fileFoto'), String(payload.siswa.nisn), 'foto')
                : null;
            const user = await User.create({ ...payload.user, role: 'Siswa' }, { client: trx });
            const siswa = await DataSiswa.create({
                ...payload.siswa,
                userId: user.id,
                fileAkta: fileAktaPath,
                fileKk: fileKkPath,
                fileIjazah: fileIjazahPath,
                fileFoto: fileFotoPath,
            }, { client: trx });
            await DataWali.createMany(payload.walis.map((wali) => ({ ...wali, nisn: siswa.nisn })), { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Berhasil Membuat Siswa Baru',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data siswa baru');
            session.flash({
                status: 'error',
                message: 'Gagal Membuat Siswa Baru',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const siswa = await DataSiswa.query()
            .where('nisn', params.id)
            .preload('user')
            .preload('dataWalis')
            .firstOrFail();
        return inertia.render('Siswa/Edit', {
            siswa,
            session: session.flashMessages.all(),
        });
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        const id = params.id;
        try {
            const payload = await request.validateUsing(userSiswaValidator);
            const siswa = await DataSiswa.query().where('nisn', id).firstOrFail();
            const user = await User.findOrFail(siswa?.userId, { client: trx });
            const { password } = payload.user;
            await this.deleteFile(siswa.fileAkta);
            await this.deleteFile(siswa.fileFoto);
            await this.deleteFile(siswa.fileIjazah);
            await this.deleteFile(siswa.fileKk);
            const fileAktaPath = request.file('siswa.fileAkta')
                ? await this.uploadFile(request.file('siswa.fileAkta'), siswa.nisn, 'akta')
                : siswa.fileAkta;
            const fileKkPath = request.file('siswa.fileKk')
                ? await this.uploadFile(request.file('siswa.fileKk'), siswa.nisn, 'kk')
                : siswa.fileKk;
            const fileIjazahPath = request.file('siswa.fileIjazah')
                ? await this.uploadFile(request.file('siswa.fileIjazah'), siswa.nisn, 'ijazah')
                : siswa.fileIjazah;
            const fileFotoPath = request.file('siswa.fileFoto')
                ? await this.uploadFile(request.file('siswa.fileFoto'), siswa.nisn, 'foto')
                : siswa.fileFoto;
            user.merge({ ...payload.user, role: 'Siswa' });
            if (password) {
                user.password = password;
            }
            await user.save();
            siswa?.useTransaction(trx);
            siswa?.merge({
                ...payload.siswa,
                fileAkta: fileAktaPath,
                fileKk: fileKkPath,
                fileIjazah: fileIjazahPath,
                fileFoto: fileFotoPath,
            });
            await siswa?.save();
            await DataWali.query({ client: trx }).where('nisn', siswa?.nisn).delete();
            await DataWali.createMany(payload.walis.map((wali) => ({ ...wali, nisn: siswa?.nisn })), { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Berhasil Mengedit Siswa',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update data siswa NISN: ${id}`);
            session.flash({
                status: 'error',
                message: 'Gagal Mengedit Siswa',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const siswa = await DataSiswa.query().where('nisn', id).firstOrFail();
            const user = await User.query().where('id', siswa.userId).firstOrFail();
            const dataKelas = await DataKelas.query();
            for (const kelas of dataKelas) {
                const siswaList = typeof kelas.siswa === 'string' ? [kelas.siswa] : kelas.siswa;
                if (Array.isArray(siswaList)) {
                    const filtered = siswaList.filter((nisn) => nisn !== id);
                    if (filtered.length !== siswaList.length) {
                        kelas.siswa = JSON.stringify(filtered);
                        await kelas.save();
                    }
                }
            }
            await this.deleteFile(siswa.fileAkta);
            await this.deleteFile(siswa.fileFoto);
            await this.deleteFile(siswa.fileIjazah);
            await this.deleteFile(siswa.fileKk);
            await siswa.delete();
            await user.delete();
            session.flash({
                status: 'success',
                message: 'Data Siswa Berhasil Dihapus',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data siswa`);
            session.flash({
                status: 'error',
                message: 'Data Siswa Gagal Dihapus',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async ppdbForm({ inertia, session }) {
        const dataWebsite = await DataWebsite.getAllSettings();
        const tahunAjaran = await DataTahunAjaran.query().orderBy('created_at', 'desc').first();
        if (!dataWebsite.ppdb) {
            return inertia.render('PPDBClose', { session: session.flashMessages.all(), ta: tahunAjaran });
        }
        return inertia.render('PPDB', { session: session.flashMessages.all(), ta: tahunAjaran });
    }
    async ppdbSuccess({ inertia, session }) {
        const jurusans = await DataJurusan.all();
        const jurusanOptions = jurusans.map((jurusan) => ({
            value: jurusan.namaJurusan,
            label: jurusan.namaJurusan,
        }));
        return inertia.render('SuccessPage', { jurusanOptions, session: session.flashMessages.all() });
    }
    async ppdbRegister({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(ppdbValidator);
            const existingSiswa = await DataSiswa.find(payload.nisn, { client: trx });
            if (existingSiswa) {
                session.flash({
                    status: 'error',
                    message: 'NISN Sudah Terdaftar',
                });
                return response.redirect().withQs().back();
            }
            const existingUser = await User.findBy('email', payload.email, { client: trx });
            if (existingUser) {
                session.flash({
                    status: 'error',
                    message: 'Email Sudah Terdaftar',
                });
                return response.redirect().withQs().back();
            }
            const fileAkta = request.file('akta')
                ? await this.uploadFile(request.file('akta'), payload.nisn, 'akta')
                : null;
            const fileKk = request.file('kk')
                ? await this.uploadFile(request.file('fileAkta'), payload.nisn, 'kk')
                : null;
            const fileIjazah = request.file('fileIjazah:')
                ? await this.uploadFile(request.file('fileIjazah:'), payload.nisn, 'ijazah')
                : null;
            const fileFoto = request.file('fileFoto')
                ? await this.uploadFile(request.file('fileFoto'), payload.nisn, 'foto')
                : null;
            const user = await User.create({
                fullName: payload.nama,
                email: payload.email,
                role: 'Siswa',
                password: payload.nisn,
            }, { client: trx });
            const siswa = await DataSiswa.create({
                nisn: payload.nisn,
                userId: user.id,
                nik: payload.nik,
                noAktaLahir: payload.noAktaLahir,
                noKk: payload.noKk,
                jenisKelamin: payload.jenisKelamin,
                tempatLahir: payload.tempatLahir,
                tanggalLahir: payload.tanggalLahir,
                agama: payload.agama,
                kewarganegaraan: payload.kewarganegaraan || 'WNI',
                alamat: payload.alamat,
                rt: payload.rt || '00',
                rw: payload.rw || '00',
                dusun: payload.dusun,
                kelurahan: payload.kelurahan,
                kecamatan: payload.kecamatan,
                kodePos: payload.kodePos,
                jenisTinggal: payload.jenisTinggal || 'Rumah Pribadi',
                transportasi: payload.transportasi,
                noTelepon: payload.noHpOrtu,
                sekolahAsal: payload.sekolahAsal || 'Tidak diketahui',
                npsn: payload.npsn,
                sekolahAsalPindahan: payload.sekolahAsalPindahan,
                suratKeteranganPindah: payload.suratKeteranganPindah,
                anakKe: payload.anakKe?.toString() || '1',
                jumlahSaudara: payload.jumlahSaudara?.toString() || '0',
                penerimaKip: payload.penerimaKip || 'Tidak',
                beratBadan: payload.beratBadan,
                tinggiBadan: payload.tinggiBadan,
                lingkarKepala: payload.lingkarKepala,
                jarakSekolah: payload.jarakSekolah,
                waktuTempuh: payload.waktuTempuh,
                jenisKesejahteraan: payload.jenisKesejahteraan || 'TIDAK ADA',
                nomorKartu: payload.nomorKartu,
                namaDiKartu: payload.namaDiKartu,
                jenisPendaftaran: payload.jenisPendaftaran || 'SISWA BARU',
                hobby: payload.hobby,
                citacita: payload.citacita,
                noKps: payload.noKps,
                fileAkta,
                fileKk,
                fileIjazah,
                fileFoto,
            }, { client: trx });
            await DataWali.create({
                nisn: siswa.nisn,
                nik: payload.nikAyah || '-',
                nama: payload.namaAyah,
                tanggalLahir: payload.tanggalLahirAyah,
                pendidikan: payload.pendidikanAyah || '-',
                pekerjaan: payload.pekerjaanAyah || '-',
                penghasilan: payload.penghasilanAyah || null,
                hubungan: 'Ayah Kandung',
                noHp: payload.noHpOrtu,
            }, { client: trx });
            await DataWali.create({
                nisn: siswa.nisn,
                nik: payload.nikIbu || '-',
                nama: payload.namaIbu,
                tanggalLahir: payload.tanggalLahirIbu,
                pendidikan: payload.pendidikanIbu || '-',
                pekerjaan: payload.pekerjaanIbu || '-',
                penghasilan: payload.penghasilanIbu || null,
                hubungan: 'Ibu Kandung',
                noHp: payload.noHpOrtu,
            }, { client: trx });
            if (payload.nikWali && payload.nikWali != payload.nikAyah) {
                await DataWali.create({
                    nisn: siswa.nisn,
                    nik: payload.nikWali || '-',
                    nama: payload.namaWali,
                    tanggalLahir: payload.tanggalLahirWali,
                    pendidikan: payload.pendidikanIbu || '-',
                    pekerjaan: payload.pekerjaanWali || '-',
                    penghasilan: payload.penghasilanWali || null,
                    hubungan: payload.hubunganDenganWali,
                    noHp: payload.noHpOrtu,
                }, { client: trx });
            }
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Pendaftaran PPDB Berhasil! Data Siswa Berhasil Disimpan',
            });
            return response.redirect().toPath('/ppdb/success');
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data PPDB');
            session.flash({
                status: 'error',
                message: 'Pendaftaran Gagal!',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async uploadFile(file, nisn, jenis) {
        const fileName = `${nisn}_${jenis}_${Date.now()}.${file.extname}`;
        const uploadPath = `storage/ppdb/${nisn}`;
        const dest = join(app.makePath(uploadPath));
        await file.move(dest, { name: `${fileName}` });
        return `${uploadPath}/${fileName}`;
    }
    async deleteFile(filePath) {
        if (!filePath)
            return;
        try {
            const fullPath = join(app.makePath(filePath));
            await fs.unlink(fullPath);
            logger.info(`File berhasil dihapus: ${filePath}`);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                logger.warn(`Gagal menghapus file ${filePath}: ${error.message}`);
            }
        }
    }
    async exportExcel({ response, request }) {
        try {
            const { search, kelasQ } = request.qs();
            const query = DataSiswa.query().preload('user').preload('dataWalis');
            if (search) {
                query.where((builder) => {
                    builder.where('nisn', 'LIKE', `%${search}%`).orWhereHas('user', (userQuery) => {
                        userQuery
                            .where('full_name', 'LIKE', `%${search}%`)
                            .orWhere('email', 'LIKE', `%${search}%`);
                    });
                });
            }
            if (kelasQ) {
                const kelasData = await DataKelas.query().where('namaKelas', kelasQ).first();
                if (!kelasData) {
                    return response.status(404).json({
                        status: 'error',
                        message: 'Kelas tidak ditemukan',
                    });
                }
                let nisnArray = [];
                try {
                    nisnArray =
                        typeof kelasData.siswa == 'string'
                            ? JSON.parse(kelasData.siswa || '[]')
                            : kelasData.siswa;
                }
                catch (error) {
                    nisnArray = [];
                }
                if (nisnArray.length === 0) {
                    return response.status(404).json({
                        status: 'error',
                        message: `Tidak ada siswa di kelas ${kelasQ}`,
                    });
                }
                query.whereIn('nisn', nisnArray);
            }
            const siswas = await query.orderBy('created_at', 'desc');
            if (siswas.length === 0) {
                const workbook = new ExcelJS.Workbook();
                const worksheet = workbook.addWorksheet('Data Siswa');
                worksheet.columns = [{ header: 'Keterangan', key: 'keterangan', width: 50 }];
                worksheet.addRow({
                    keterangan: 'Tidak ada data siswa yang ditemukan',
                });
                const buffer = await workbook.xlsx.writeBuffer();
                const fileName = `data_siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
                response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                response.header('Content-Disposition', `attachment; filename=${fileName}`);
                return response.send(buffer);
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Data Siswa');
            worksheet.columns = [
                { header: 'NISN', key: 'nisn', width: 15 },
                { header: 'Nama Lengkap', key: 'nama_lengkap', width: 25 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'NIK', key: 'nik', width: 20 },
                { header: 'No Akta Lahir', key: 'no_akta_lahir', width: 20 },
                { header: 'No KK', key: 'no_kk', width: 20 },
                { header: 'Jenis Kelamin', key: 'jenis_kelamin', width: 15 },
                { header: 'Tempat Lahir', key: 'tempat_lahir', width: 15 },
                { header: 'Tanggal Lahir', key: 'tanggal_lahir', width: 15 },
                { header: 'Agama', key: 'agama', width: 15 },
                { header: 'Kewarganegaraan', key: 'kewarganegaraan', width: 15 },
                { header: 'Alamat', key: 'alamat', width: 30 },
                { header: 'RT', key: 'rt', width: 10 },
                { header: 'RW', key: 'rw', width: 10 },
                { header: 'Dusun', key: 'dusun', width: 15 },
                { header: 'Kelurahan', key: 'kelurahan', width: 15 },
                { header: 'Kecamatan', key: 'kecamatan', width: 15 },
                { header: 'Kode Pos', key: 'kode_pos', width: 10 },
                { header: 'Jenis Tinggal', key: 'jenis_tinggal', width: 15 },
                { header: 'Transportasi', key: 'transportasi', width: 15 },
                { header: 'No Telepon', key: 'no_telepon', width: 15 },
                { header: 'Sekolah Asal', key: 'sekolah_asal', width: 20 },
                { header: 'NPSN', key: 'npsn', width: 15 },
                { header: 'Anak Ke', key: 'anak_ke', width: 10 },
                { header: 'Jumlah Saudara', key: 'jumlah_saudara', width: 15 },
                { header: 'Penerima KIP', key: 'penerima_kip', width: 15 },
                { header: 'Berat Badan', key: 'berat_badan', width: 15 },
                { header: 'Tinggi Badan', key: 'tinggi_badan', width: 15 },
                { header: 'Lingkar Kepala', key: 'lingkar_kepala', width: 15 },
                { header: 'Jarak Sekolah', key: 'jarak_sekolah', width: 15 },
                { header: 'Waktu Tempuh', key: 'waktu_tempuh', width: 15 },
                { header: 'Hobby', key: 'hobby', width: 20 },
                { header: 'Cita-cita', key: 'cita_cita', width: 20 },
                { header: 'Jenis Pendaftaran', key: 'jenis_pendaftaran', width: 20 },
                { header: 'Nama Ayah', key: 'nama_ayah', width: 25 },
                { header: 'NIK Ayah', key: 'nik_ayah', width: 20 },
                { header: 'Tanggal Lahir Ayah', key: 'tgl_lahir_ayah', width: 15 },
                { header: 'Pendidikan Ayah', key: 'pendidikan_ayah', width: 15 },
                { header: 'Pekerjaan Ayah', key: 'pekerjaan_ayah', width: 20 },
                { header: 'Penghasilan Ayah', key: 'penghasilan_ayah', width: 15 },
                { header: 'Nama Ibu', key: 'nama_ibu', width: 25 },
                { header: 'NIK Ibu', key: 'nik_ibu', width: 20 },
                { header: 'Tanggal Lahir Ibu', key: 'tgl_lahir_ibu', width: 15 },
                { header: 'Pendidikan Ibu', key: 'pendidikan_ibu', width: 15 },
                { header: 'Pekerjaan Ibu', key: 'pekerjaan_ibu', width: 20 },
                { header: 'Penghasilan Ibu', key: 'penghasilan_ibu', width: 15 },
                { header: 'Nama Wali', key: 'nama_wali', width: 25 },
                { header: 'NIK Wali', key: 'nik_wali', width: 20 },
                { header: 'Tanggal Lahir Wali', key: 'tgl_lahir_wali', width: 15 },
                { header: 'Pendidikan Wali', key: 'pendidikan_wali', width: 15 },
                { header: 'Pekerjaan Wali', key: 'pekerjaan_wali', width: 20 },
                { header: 'Penghasilan Wali', key: 'penghasilan_wali', width: 15 },
                { header: 'Hubungan Wali', key: 'hubungan_wali', width: 15 },
            ];
            siswas.forEach((siswa) => {
                const user = siswa.user;
                const walis = siswa.dataWalis;
                const ayah = walis.find((w) => w.hubungan === 'Ayah Kandung' || w.hubungan === 'Ayah');
                const ibu = walis.find((w) => w.hubungan === 'Ibu Kandung' || w.hubungan === 'Ibu');
                const wali = walis.find((w) => !['Ayah Kandung', 'Ibu Kandung', 'Ayah', 'Ibu'].includes(w.hubungan));
                worksheet.addRow({
                    nisn: siswa.nisn,
                    nama_lengkap: user?.fullName,
                    email: user?.email,
                    nik: siswa.nik,
                    no_akta_lahir: siswa.noAktaLahir,
                    no_kk: siswa.noKk,
                    jenis_kelamin: siswa.jenisKelamin,
                    tempat_lahir: siswa.tempatLahir,
                    tanggal_lahir: siswa.tanggalLahir,
                    agama: siswa.agama,
                    kewarganegaraan: siswa.kewarganegaraan,
                    alamat: siswa.alamat,
                    rt: siswa.rt,
                    rw: siswa.rw,
                    dusun: siswa.dusun,
                    kelurahan: siswa.kelurahan,
                    kecamatan: siswa.kecamatan,
                    kode_pos: siswa.kodePos,
                    jenis_tinggal: siswa.jenisTinggal,
                    transportasi: siswa.transportasi,
                    no_telepon: siswa.noTelepon,
                    sekolah_asal: siswa.sekolahAsal,
                    npsn: siswa.npsn,
                    anak_ke: siswa.anakKe,
                    jumlah_saudara: siswa.jumlahSaudara,
                    penerima_kip: siswa.penerimaKip,
                    berat_badan: siswa.beratBadan,
                    tinggi_badan: siswa.tinggiBadan,
                    lingkar_kepala: siswa.lingkarKepala,
                    jarak_sekolah: siswa.jarakSekolah,
                    waktu_tempuh: siswa.waktuTempuh,
                    hobby: siswa.hobby,
                    cita_cita: siswa.citacita,
                    jenis_pendaftaran: siswa.jenisPendaftaran,
                    nama_ayah: ayah?.nama,
                    nik_ayah: ayah?.nik,
                    tgl_lahir_ayah: ayah?.tanggalLahir,
                    pendidikan_ayah: ayah?.pendidikan,
                    pekerjaan_ayah: ayah?.pekerjaan,
                    penghasilan_ayah: ayah?.penghasilan,
                    nama_ibu: ibu?.nama,
                    nik_ibu: ibu?.nik,
                    tgl_lahir_ibu: ibu?.tanggalLahir,
                    pendidikan_ibu: ibu?.pendidikan,
                    pekerjaan_ibu: ibu?.pekerjaan,
                    penghasilan_ibu: ibu?.penghasilan,
                    nama_wali: wali?.nama,
                    nik_wali: wali?.nik,
                    tgl_lahir_wali: wali?.tanggalLahir,
                    pendidikan_wali: wali?.pendidikan,
                    pekerjaan_wali: wali?.pekerjaan,
                    penghasilan_wali: wali?.penghasilan,
                    hubungan_wali: wali?.hubungan,
                });
            });
            worksheet.getRow(1).font = { bold: true };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE6E6FA' },
            };
            const buffer = await workbook.xlsx.writeBuffer();
            const fileName = kelasQ
                ? `data_siswa_${kelasQ}_${new Date().toISOString().split('T')[0]}.xlsx`
                : `data_siswa_${new Date().toISOString().split('T')[0]}.xlsx`;
            response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            response.header('Content-Disposition', `attachment; filename=${fileName}`);
            return response.send(buffer);
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal export data siswa ke Excel');
            return response.status(500).json({
                status: 'error',
                message: 'Gagal export data siswa',
            });
        }
    }
    async importExcel({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const excelFile = request.file('excel_file');
            if (!excelFile || !excelFile.isValid) {
                session.flash({
                    status: 'error',
                    message: 'File Excel tidak valid atau belum diupload',
                });
                return response.redirect().withQs().back();
            }
            const tempPath = join(app.makePath('tmp'), `import_${Date.now()}.xlsx`);
            await excelFile.move(app.makePath('tmp'), {
                name: `import_${Date.now()}.xlsx`,
                overwrite: true,
            });
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(tempPath);
            const worksheet = workbook.getWorksheet('Data Siswa');
            if (!worksheet) {
                session.flash({
                    status: 'error',
                    message: 'Worksheet "Data Siswa" tidak ditemukan',
                });
                return response.redirect().withQs().back();
            }
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            const normalize = (val) => (val ? val.toString().trim().toLowerCase() : '');
            const normalizeCase = (val) => (val ? val.toString().trim().replace(/\s+/g, ' ') : '');
            const parseDate = (val) => {
                if (!val)
                    return null;
                try {
                    if (typeof val === 'number') {
                        return new Date(Math.round((val - 25569) * 86400 * 1000));
                    }
                    const parsed = new Date(val);
                    return isNaN(parsed.getTime()) ? null : parsed;
                }
                catch {
                    return null;
                }
            };
            for (let i = 2; i <= worksheet.rowCount; i++) {
                const row = worksheet.getRow(i);
                try {
                    const nisn = row.getCell(1).value?.toString().trim();
                    if (!nisn) {
                        errorCount++;
                        errors.push(`Row ${i}: NISN kosong`);
                        continue;
                    }
                    const existingSiswa = await DataSiswa.find(nisn, { client: trx });
                    if (existingSiswa) {
                        errorCount++;
                        errors.push(`Row ${i}: Siswa dengan NISN ${nisn} sudah terdaftar`);
                        continue;
                    }
                    let email = row.getCell(3).value;
                    if (typeof email == 'object') {
                        email = email.text.toString().trim() || `${nisn}@siswa.school`;
                    }
                    else {
                        email = email?.toString().trim() || `${nisn}@siswa.school`;
                    }
                    const existingUser = await User.findBy('email', email, { client: trx });
                    if (existingUser) {
                        errorCount++;
                        errors.push(`Row ${i}: Email ${email} sudah terdaftar`);
                        continue;
                    }
                    const user = await User.create({
                        fullName: normalizeCase(row.getCell(2).value),
                        email,
                        role: 'Siswa',
                        password: nisn,
                    }, { client: trx });
                    await DataSiswa.create({
                        nisn,
                        userId: user.id,
                        nik: row.getCell(4).value?.toString(),
                        noAktaLahir: row.getCell(5).value?.toString(),
                        noKk: row.getCell(6).value?.toString(),
                        status: 'siswa',
                        jenisKelamin: normalize(row.getCell(7).value) === 'laki-laki' ? 'Laki-laki' : 'Perempuan',
                        tempatLahir: normalizeCase(row.getCell(8).value),
                        tanggalLahir: parseDate(row.getCell(9).value) ?? new Date(),
                        agama: normalizeCase(row.getCell(10).value),
                        kewarganegaraan: normalize(row.getCell(11).value) === 'wni' ? 'WNI' : 'WNA',
                        alamat: normalizeCase(row.getCell(12).value),
                        rt: row.getCell(13).value?.toString() || '00',
                        rw: row.getCell(14).value?.toString() || '00',
                        dusun: normalizeCase(row.getCell(15).value),
                        kelurahan: normalizeCase(row.getCell(16).value),
                        kecamatan: normalizeCase(row.getCell(17).value),
                        kodePos: row.getCell(18).value?.toString(),
                        jenisTinggal: normalizeCase(row.getCell(19).value) || 'Rumah Pribadi',
                        transportasi: normalizeCase(row.getCell(20).value),
                        noTelepon: row.getCell(21).value?.toString(),
                        sekolahAsal: normalizeCase(row.getCell(22).value) || 'Tidak diketahui',
                        npsn: row.getCell(23).value?.toString(),
                        anakKe: row.getCell(24).value?.toString() || '1',
                        jumlahSaudara: row.getCell(25).value?.toString() || '0',
                        penerimaKip: normalize(row.getCell(26).value) === 'iya' ? 'Iya' : 'Tidak',
                        beratBadan: row.getCell(27).value?.toString(),
                        tinggiBadan: row.getCell(28).value?.toString(),
                        lingkarKepala: row.getCell(29).value?.toString(),
                        jarakSekolah: row.getCell(30).value?.toString(),
                        waktuTempuh: row.getCell(31).value?.toString(),
                        hobby: normalizeCase(row.getCell(32).value),
                        citacita: normalizeCase(row.getCell(33).value),
                        jenisPendaftaran: (() => {
                            const val = normalize(row.getCell(34).value);
                            if (val.includes('baru'))
                                return 'SISWA BARU';
                            if (val.includes('pindah'))
                                return 'PINDAHAN';
                            return 'KEMBALI BERSEKOLAH';
                        })(),
                    }, { client: trx });
                    if (row.getCell(35).value) {
                        await DataWali.create({
                            nisn,
                            nik: row.getCell(36).value?.toString() || '-',
                            nama: normalizeCase(row.getCell(35).value),
                            tanggalLahir: parseDate(row.getCell(37).value),
                            pendidikan: normalizeCase(row.getCell(38).value),
                            pekerjaan: normalizeCase(row.getCell(39).value),
                            penghasilan: row.getCell(40).value?.toString(),
                            hubungan: 'Ayah Kandung',
                            noHp: row.getCell(21).value?.toString(),
                        }, { client: trx });
                    }
                    if (row.getCell(41).value) {
                        await DataWali.create({
                            nisn,
                            nik: row.getCell(42).value?.toString() || '-',
                            nama: normalizeCase(row.getCell(41).value),
                            tanggalLahir: parseDate(row.getCell(43).value),
                            pendidikan: normalizeCase(row.getCell(44).value),
                            pekerjaan: normalizeCase(row.getCell(45).value),
                            penghasilan: row.getCell(46).value?.toString(),
                            hubungan: 'Ibu Kandung',
                            noHp: row.getCell(21).value?.toString(),
                        }, { client: trx });
                    }
                    if (row.getCell(47).value) {
                        await DataWali.create({
                            nisn,
                            nik: row.getCell(48).value?.toString() || '-',
                            nama: normalizeCase(row.getCell(47).value),
                            tanggalLahir: parseDate(row.getCell(49).value),
                            pendidikan: normalizeCase(row.getCell(50).value),
                            pekerjaan: normalizeCase(row.getCell(51).value),
                            penghasilan: row.getCell(52).value?.toString(),
                            hubungan: normalizeCase(row.getCell(53).value) || 'Wali',
                            noHp: row.getCell(21).value?.toString(),
                        }, { client: trx });
                    }
                    successCount++;
                }
                catch (error) {
                    errorCount++;
                    errors.push(`Row ${i}: ${error.message}`);
                    logger.error({ err: error }, `Gagal import row ${i}`);
                }
            }
            await trx.commit();
            await fs.unlink(tempPath);
            session.flash({
                status: successCount > 0 ? 'success' : 'error',
                message: `Import selesai. Berhasil: ${successCount}, Gagal: ${errorCount}`,
                errors: errors.slice(0, 10),
            });
            console.log(errors);
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal import data siswa');
            session.flash({
                status: 'error',
                message: 'Gagal import data siswa',
                error: error.message,
            });
            return response.redirect().withQs().back();
        }
    }
}
//# sourceMappingURL=data_siswas_controller.js.map