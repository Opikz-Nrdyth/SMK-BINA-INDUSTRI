import DataGuru from '#models/data_guru';
import User from '#models/user';
import { userGuruValidator } from '#validators/data_guru';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
import fs from 'fs/promises';
import ExcelJS from 'exceljs';
import { join } from 'path';
import app from '@adonisjs/core/services/app';
import DataKelas from '#models/data_kelas';
import DataMapel from '#models/data_mapel';
import BankSoal from '#models/bank_soal';
export default class DataGurusController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const selectedMapel = request.input('mapel', '');
        const baseQuery = DataGuru.query().preload('user').preload('mapel');
        if (search) {
            baseQuery.where((builder) => {
                builder
                    .where('nip', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`);
            });
        }
        if (selectedMapel) {
            baseQuery.whereExists((subquery) => {
                subquery
                    .from('data_mapels')
                    .whereRaw('JSON_CONTAINS(data_mapels.guru_ampu, JSON_QUOTE(data_gurus.nip))')
                    .andWhere('data_mapels.nama_mata_pelajaran', 'LIKE', `%${selectedMapel}%`);
            });
        }
        const guruPaginate = await baseQuery.orderBy('createdAt', 'desc').paginate(page, 15);
        const sortedGuru = guruPaginate.all().sort((a, b) => {
            const nameA = a.user?.fullName?.toLowerCase() || '';
            const nameB = b.user?.fullName?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
        });
        const startNumber = (page - 1) * 15 + 1;
        const mapelList = await db
            .from('data_mapels')
            .select('nama_mata_pelajaran')
            .select(db.raw('SUM(COALESCE(JSON_LENGTH(guru_ampu), 0)) AS jumlahGuru'))
            .groupBy('nama_mata_pelajaran');
        const dataGuru = await Promise.all(sortedGuru.map(async (item, index) => {
            const mapel = await item.mapelAmpuGuru();
            return {
                ...item.serialize(),
                nomor: startNumber + index,
                mapel,
            };
        }));
        return inertia.render('Guru/Index', {
            guruPaginate: {
                currentPage: guruPaginate.currentPage,
                lastPage: guruPaginate.lastPage,
                total: guruPaginate.total,
                perPage: guruPaginate.perPage,
            },
            gurus: dataGuru,
            mapelList,
            selectedMapel,
            searchQuery: search,
            session: session.flashMessages.all(),
        });
    }
    async create({ inertia, session }) {
        return inertia.render('Guru/Create', { session: session.flashMessages.all() });
    }
    async cekUser({ params, response }) {
        const trx = await db.transaction();
        const email = params.id;
        let user = await User.query({ client: trx })
            .preload('dataGuru')
            .preload('dataStaf')
            .where('email', email)
            .first();
        let dataGuru = user?.dataGuru;
        if (dataGuru) {
            response.json({
                status: 'notReady',
                message: 'Tidak Bisa Membuat Lebih 1 Data Dengan Guru Yang Sama',
            });
        }
        else if (user && dataGuru == null) {
            response.json({
                status: 'ready',
                data: user,
            });
        }
        else {
            response.json({
                status: 'notReady',
                message: 'Tidak ada data! Buat data Baru',
            });
        }
    }
    async store({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(userGuruValidator);
            const fileFoto = request.file('guru.fileFoto')
                ? await this.uploadFile(request.file('guru.fileFoto'), String(payload.guru.nip))
                : null;
            let user = await User.query({ client: trx }).where('email', payload.user.email).first();
            if (user) {
                user.role = 'Staf';
                user.save();
            }
            if (!user) {
                user = await User.create({ ...payload.user, role: 'Guru' }, { client: trx });
            }
            await DataGuru.create({ ...payload.guru, userId: user.id, fileFoto: fileFoto }, { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data guru berhasil ditambahkan.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data guru baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan data guru',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const guru = await DataGuru.query().where('nip', params.id).preload('user').firstOrFail();
        return inertia.render('Guru/Edit', { guru, session: session.flashMessages.all() });
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        const id = params.id;
        try {
            const payload = await request.validateUsing(userGuruValidator);
            const guru = await DataGuru.query().where('nip', id).firstOrFail();
            const user = await User.findOrFail(guru?.userId, { client: trx });
            const { password } = payload.user;
            const fileFoto = request.file('guru.fileFoto')
                ? await this.uploadFile(request.file('guru.fileFoto'), guru.nip)
                : guru.fileFoto;
            user.merge(payload.user);
            if (password) {
                user.password = password;
            }
            await user.save();
            guru?.useTransaction(trx);
            guru?.merge({ ...payload.guru, fileFoto: fileFoto });
            await guru?.save();
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data guru berhasil diperbarui.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update data guru NIP: ${id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui data guru',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const guru = await DataGuru.query().where('nip', id).firstOrFail();
            const user = await User.query()
                .where('id', guru.userId)
                .preload('dataGuru')
                .preload('dataStaf')
                .firstOrFail();
            const dataKelas = await DataKelas.query();
            for (const kelas of dataKelas) {
                const guruPengampu = typeof kelas.guruPengampu === 'string' ? [kelas.guruPengampu] : kelas.guruPengampu;
                if (Array.isArray(guruPengampu)) {
                    const filtered = guruPengampu.filter((nip) => nip !== guru.nip);
                    if (filtered.length !== guruPengampu.length) {
                        kelas.guruPengampu = JSON.stringify(filtered);
                        await kelas.save();
                    }
                }
            }
            const dataMapel = await DataMapel.query();
            for (const mapel of dataMapel) {
                const guruAmpu = typeof mapel.guruAmpu === 'string' ? [mapel.guruAmpu] : mapel.guruAmpu;
                if (Array.isArray(guruAmpu)) {
                    const filtered = guruAmpu.filter((nip) => nip !== guru.nip);
                    if (filtered.length !== guruAmpu.length) {
                        mapel.guruAmpu = JSON.stringify(filtered);
                        await mapel.save();
                    }
                }
            }
            const dataBankSoal = await BankSoal.query();
            for (const bankSoal of dataBankSoal) {
                const penulis = typeof bankSoal.penulis === 'string' ? [bankSoal.penulis] : bankSoal.penulis;
                if (Array.isArray(penulis)) {
                    const filtered = penulis.filter((nip) => nip !== guru.nip);
                    if (filtered.length !== penulis.length) {
                        bankSoal.penulis = filtered;
                        await bankSoal.save();
                    }
                }
            }
            if (guru.fileFoto) {
                await this.deleteFile(guru.fileFoto);
            }
            await guru.delete();
            if (!user.dataStaf) {
                await user.delete();
            }
            session.flash({
                status: 'success',
                message: 'Data guru berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data guru`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus data guru',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async exportExcel({ response }) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Data Guru');
        sheet.columns = [
            { header: 'NIP', key: 'nip', width: 20 },
            { header: 'Nama Lengkap', key: 'namaLengkap', width: 25 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Nomor HP', key: 'noHp', width: 20 },
            { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
            { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
            { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 20 },
            { header: 'Alamat', key: 'alamat', width: 40 },
            { header: 'Agama', key: 'agama', width: 20 },
            { header: 'Gelar Depan', key: 'gelarDepan', width: 20 },
            { header: 'Gelar Belakang', key: 'gelarBelakang', width: 20 },
        ];
        const gurus = await DataGuru.query().preload('user');
        gurus.forEach((guru) => {
            sheet.addRow({
                nip: guru.nip,
                namaLengkap: guru.user.fullName,
                email: guru.user.email,
                noHp: guru.noTelepon,
                jenisKelamin: guru.jenisKelamin,
                tempatLahir: guru.tempatLahir,
                tanggalLahir: guru.tanggalLahir,
                alamat: guru.alamat,
                agama: guru.agama,
                gelarDepan: guru.gelarDepan,
                gelarBelakang: guru.gelarBelakang,
            });
        });
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6E6FA' },
        };
        const buffer = await workbook.xlsx.writeBuffer();
        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.header('Content-Disposition', 'attachment; filename="data_guru.xlsx"');
        return response.send(buffer);
    }
    async importExcel({ request, response, session }) {
        const file = request.file('excel_file');
        if (!file) {
            session.flash({
                status: 'error',
                message: 'Data Excel wajib diunggah.',
            });
            console.log('❌ File Excel wajib diunggah');
            return response.redirect().withQs().back();
        }
        const buffer = await fs.readFile(file.tmpPath);
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const sheet = workbook.getWorksheet(1);
        let berhasil = 0;
        let gagal = 0;
        for (const row of sheet?.getRows(2, sheet.rowCount - 1) || []) {
            const [nip, namaLengkap, email, noHp, jenisKelamin, tempatLahir, tanggalLahir, alamat, agama, gelarDepan, gelarBelakang,] = row.values?.slice(1) || [];
            if (!namaLengkap)
                continue;
            try {
                let emailUser = email.toLowerCase().trim();
                if (typeof email == 'object') {
                    emailUser = email.text.toLowerCase().trim();
                }
                const existingUser = await User.query()
                    .where('email', emailUser)
                    .orWhereHas('dataStaf', (stafQuery) => {
                    stafQuery.where('nip', String(nip ?? ''));
                })
                    .first();
                if (existingUser) {
                    console.log(`⚠️ User dengan email ${email} atau NIP ${nip} sudah ada.`);
                    gagal++;
                    continue;
                }
                const user = await User.create({
                    fullName: String(namaLengkap ?? ''),
                    email: emailUser,
                    password: '12345678',
                });
                await DataGuru.create({
                    userId: user.id,
                    noTelepon: String(noHp ?? ''),
                    nip: String(nip ?? ''),
                    agama: String(agama ?? ''),
                    gelarDepan: String(gelarDepan ?? ''),
                    gelarBelakang: String(gelarBelakang ?? ''),
                    tempatLahir: String(tempatLahir ?? ''),
                    jenisKelamin: String(jenisKelamin ?? ''),
                    tanggalLahir: tanggalLahir,
                    alamat: String(alamat ?? ''),
                });
                berhasil++;
            }
            catch (err) {
                gagal++;
            }
        }
        session.flash({
            status: 'success',
            message: `Import selesai. Berhasil: ${berhasil}, Gagal: ${gagal}`,
        });
        return response.redirect().withQs().back();
    }
    async uploadFile(file, nip) {
        const fileName = `${nip}_${Date.now()}.${file.extname}`;
        const uploadPath = `storage/guru/`;
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
}
//# sourceMappingURL=data_gurus_controller.js.map