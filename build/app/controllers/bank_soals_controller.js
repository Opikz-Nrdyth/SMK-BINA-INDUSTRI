import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';
import BankSoal from '#models/bank_soal';
import { bankSoalValidator } from '#validators/bank_soal';
import DataJurusan from '#models/data_jurusan';
import User from '#models/user';
import encryption from '@adonisjs/core/services/encryption';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import app from '@adonisjs/core/services/app';
import DataMapel from '#models/data_mapel';
import DataKelas from '#models/data_kelas';
export default class BankSoalsController {
    async index({ request, inertia, session, auth }) {
        try {
            const page = request.input('page', 1);
            const search = request.input('search', '');
            await auth.check();
            const [totalBankSoal] = await Promise.all([BankSoal.query().count('* as total').first()]);
            const query = BankSoal.query();
            if (search) {
                query.where((builder) => {
                    builder
                        .where('nama_ujian', 'LIKE', `%${search}%`)
                        .orWhere('jenjang', 'LIKE', `%${search}%`)
                        .orWhere('jenis_ujian', 'LIKE', `%${search}%`)
                        .orWhere('kode', 'LIKE', `%${search}%`);
                });
            }
            const bankSoalPaginate = await query
                .orderBy('created_at', 'desc')
                .paginate(page, search ? Number(totalBankSoal?.$extras.total) || 1 : 15);
            const bankSoalsWithDetails = await Promise.all(bankSoalPaginate.all().map(async (soal) => {
                const jurusanDetails = await DataJurusan.query()
                    .whereIn('id', soal.jurusan)
                    .select('id', 'nama_jurusan');
                const penulisDetails = await User.query()
                    .whereIn('id', soal.penulis)
                    .select('id', 'full_name');
                const mapelDetails = await DataMapel.query()
                    .where('id', soal.mapelId)
                    .select('id', 'namaMataPelajaran');
                return {
                    ...soal.toJSON(),
                    mapelDetails: mapelDetails.map((m) => m.namaMataPelajaran),
                    jurusanDetails: jurusanDetails.map((j) => j.namaJurusan),
                    penulisDetails: penulisDetails.map((p) => p.fullName),
                };
            }));
            logger.info('Jumlah Bank Soal: ', Number(totalBankSoal?.$extras.total));
            return inertia.render('BankSoal/Index', {
                bankSoalPaginate: {
                    currentPage: bankSoalPaginate.currentPage,
                    lastPage: bankSoalPaginate.lastPage,
                    total: bankSoalPaginate.total,
                    perPage: bankSoalPaginate.perPage,
                    firstPage: 1,
                    nextPage: bankSoalPaginate.currentPage < bankSoalPaginate.lastPage
                        ? bankSoalPaginate.currentPage + 1
                        : null,
                    previousPage: bankSoalPaginate.currentPage > 1 ? bankSoalPaginate.currentPage - 1 : null,
                },
                bankSoals: bankSoalsWithDetails,
                session: session.flashMessages.all(),
                searchQuery: search,
                auth: auth.user,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat data bank soal');
            session.flash({
                status: 'error',
                message: 'Gagal memuat data bank soal',
                error: error,
            });
            return inertia.render('BankSoal/Index', {
                bankSoalPaginate: {
                    currentPage: 1,
                    lastPage: 1,
                    total: 0,
                    perPage: 15,
                    firstPage: 1,
                    nextPage: null,
                    previousPage: null,
                },
                bankSoals: [],
                session: session.flashMessages.all(),
                searchQuery: '',
                auth: auth.user,
            });
        }
    }
    async indexGuru({ request, inertia, session, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            const page = request.input('page', 1);
            const search = request.input('search', '');
            let query = BankSoal.query().whereRaw('JSON_CONTAINS(penulis, ?)', [`"${user.id}"`]);
            if (search) {
                query.where((builder) => {
                    builder
                        .where('nama_ujian', 'LIKE', `%${search}%`)
                        .orWhere('jenjang', 'LIKE', `%${search}%`)
                        .orWhere('jenis_ujian', 'LIKE', `%${search}%`)
                        .orWhere('kode', 'LIKE', `%${search}%`);
                });
            }
            const bankSoalPaginate = await query.orderBy('created_at', 'desc').paginate(page, 15);
            const bankSoalsWithDetails = await Promise.all(bankSoalPaginate.all().map(async (soal) => {
                const jurusanDetails = await DataJurusan.query()
                    .whereIn('id', soal.jurusan)
                    .select('id', 'nama_jurusan');
                const penulisDetails = await User.query()
                    .whereIn('id', soal.penulis)
                    .select('id', 'full_name');
                const mapelDetails = await DataMapel.query()
                    .where('id', soal.mapelId)
                    .select('id', 'namaMataPelajaran');
                return {
                    ...soal.toJSON(),
                    mapelDetails: mapelDetails.map((m) => m.namaMataPelajaran),
                    jurusanDetails: jurusanDetails.map((j) => j.namaJurusan),
                    penulisDetails: penulisDetails.map((p) => p.fullName),
                };
            }));
            return inertia.render('BankSoal/Index', {
                bankSoalPaginate: {
                    currentPage: bankSoalPaginate.currentPage,
                    lastPage: bankSoalPaginate.lastPage,
                    total: bankSoalPaginate.total,
                    perPage: bankSoalPaginate.perPage,
                    firstPage: 1,
                    nextPage: bankSoalPaginate.currentPage < bankSoalPaginate.lastPage
                        ? bankSoalPaginate.currentPage + 1
                        : null,
                    previousPage: bankSoalPaginate.currentPage > 1 ? bankSoalPaginate.currentPage - 1 : null,
                },
                bankSoals: bankSoalsWithDetails,
                session: session.flashMessages.all(),
                searchQuery: search,
                auth: auth.user,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat data bank soal guru');
            session.flash({
                status: 'error',
                message: 'Gagal memuat data bank soal',
                error: error,
            });
            return inertia.render('BankSoal/Index', {
                bankSoalPaginate: {
                    currentPage: 1,
                    lastPage: 1,
                    total: 0,
                    perPage: 15,
                    firstPage: 1,
                    nextPage: null,
                    previousPage: null,
                },
                bankSoals: [],
                session: session.flashMessages.all(),
                searchQuery: '',
                auth: auth.user,
            });
        }
    }
    async create({ inertia, session }) {
        try {
            const [jurusanList, usersList, mapelList] = await Promise.all([
                DataJurusan.query(),
                User.query().select('id', 'full_name').where('role', 'Guru'),
                DataMapel.query(),
            ]);
            return inertia.render('BankSoal/Create', {
                jurusanList,
                usersList,
                mapelList,
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat halaman create bank soal');
            session.flash({
                status: 'error',
                message: 'Gagal memuat halaman buat bank soal',
                error: error,
            });
            return inertia.render('BankSoal/Create', {
                jurusanList: [],
                usersList: [],
                mapelList: [],
                session: session.flashMessages.all(),
            });
        }
    }
    async edit({ inertia, params, session }) {
        const bankSoal = await BankSoal.findOrFail(params.id);
        const [jurusanList, usersList, mapelList] = await Promise.all([
            DataJurusan.query().select('id', 'nama_jurusan'),
            User.query().select('id', 'full_name'),
            DataMapel.query(),
        ]);
        return inertia.render('BankSoal/Edit', {
            bankSoal,
            jurusanList,
            usersList,
            mapelList,
            session: session.flashMessages.all(),
        });
    }
    async createGuru({ inertia, auth, session }) {
        try {
            await auth.check();
            const user = auth.user;
            await user.load('dataGuru');
            const nip = user.dataGuru.nip;
            const dataKelas = await DataKelas.query().whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [
                `"${nip}"`,
            ]);
            const kelasIds = dataKelas.map((kelas) => kelas.id);
            const jurusanList = await DataJurusan.query()
                .whereRaw('JSON_OVERLAPS(kelas_id, ?)', [JSON.stringify(kelasIds)])
                .orderBy('nama_jurusan', 'asc');
            const mapelList = await DataMapel.query();
            return inertia.render('BankSoal/Create', {
                jurusanList,
                mapelList,
                usersList: [user],
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat halaman create bank soal guru');
            session.flash({
                status: 'error',
                message: 'Gagal memuat halaman buat bank soal',
                error: error,
            });
            return inertia.render('BankSoal/Create', {
                jurusanList: [],
                mapelList: [],
                usersList: [],
                session: session.flashMessages.all(),
            });
        }
    }
    async editGuru({ inertia, params, auth, session }) {
        await auth.check();
        const user = auth.user;
        await user.load('dataGuru');
        const nip = user.dataGuru.nip;
        const bankSoal = await BankSoal.query()
            .where('id', params.id)
            .whereRaw('JSON_CONTAINS(penulis, ?)', [`"${user.id}"`])
            .firstOrFail();
        const dataKelas = await DataKelas.query().whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [
            `"${nip}"`,
        ]);
        const kelasIds = dataKelas.map((kelas) => kelas.id);
        const jurusanList = await DataJurusan.query()
            .whereRaw('JSON_OVERLAPS(kelas_id, ?)', [JSON.stringify(kelasIds)])
            .orderBy('nama_jurusan', 'asc');
        const mapelList = await DataMapel.query();
        return inertia.render('BankSoal/Edit', {
            bankSoal,
            jurusanList,
            mapelList,
            usersList: [user],
            session: session.flashMessages.all(),
        });
    }
    async store({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(bankSoalValidator);
            const fileName = `${payload.namaUjian || 'soal'}-${Date.now()}.opz`;
            const filePath = join(app.makePath('storage/soal_files'), fileName);
            await mkdir(app.makePath('storage/soal_files'), { recursive: true });
            const encryptedContent = encryption.encrypt(payload.soalFile);
            await writeFile(filePath, encryptedContent);
            await BankSoal.create({
                namaUjian: payload.namaUjian,
                jenjang: payload.jenjang,
                jurusan: payload.jurusan,
                jenisUjian: payload.jenisUjian,
                penulis: payload.penulis,
                kode: payload.kode,
                mapelId: payload.mapel,
                waktu: payload.waktu,
                tanggalUjian: payload.tanggalUjian,
                soalFile: fileName,
            }, { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Bank soal berhasil ditambahkan.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan bank soal baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan bank soal',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(bankSoalValidator);
            const bankSoal = await BankSoal.findOrFail(params.id);
            bankSoal.merge({
                namaUjian: payload.namaUjian,
                jenjang: payload.jenjang,
                jurusan: payload.jurusan,
                kode: payload.kode,
                jenisUjian: payload.jenisUjian,
                mapelId: payload.mapel,
                penulis: payload.penulis,
                waktu: payload.waktu,
                tanggalUjian: payload.tanggalUjian,
            });
            await bankSoal.save();
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Bank soal berhasil diperbarui.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update bank soal`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui bank soal',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const bankSoal = await BankSoal.findOrFail(id);
            await bankSoal.delete();
            session.flash({
                status: 'success',
                message: 'Bank soal berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus bank soal`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus bank soal',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async getFileContent({ request, response }) {
        try {
            const { id } = request.params();
            const bankSoal = await BankSoal.findOrFail(id);
            if (!bankSoal.soalFile) {
                return response.status(404).json({
                    success: false,
                    message: 'File soal tidak ditemukan',
                });
            }
            const filePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
            const fileContent = await readFile(filePath, 'utf-8');
            const decryptedContent = encryption.decrypt(fileContent);
            return response.json({
                success: true,
                data: {
                    id: bankSoal.id,
                    namaUjian: bankSoal.namaUjian,
                    kode: bankSoal.kode,
                    content: typeof decryptedContent === 'string' ? JSON.parse(decryptedContent) : decryptedContent,
                },
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal membaca file soal ${request.params().id}`);
            return response.status(500).json({
                success: false,
                message: 'Gagal membaca file soal',
            });
        }
    }
    async updateSoal({ request, response, session, params }) {
        try {
            const { soalContent } = request.only(['soalContent']);
            const bankSoal = await BankSoal.findOrFail(params.id);
            if (!Array.isArray(soalContent)) {
                throw new Error('Format konten soal tidak valid');
            }
            for (const [index, soal] of soalContent.entries()) {
                if (!soal.id ||
                    !soal.soal ||
                    !soal.A ||
                    !soal.B ||
                    !soal.C ||
                    !soal.D ||
                    !soal.E ||
                    !soal.kunci) {
                    throw new Error(`Soal nomor ${index + 1} tidak lengkap`);
                }
                if (!['A', 'B', 'C', 'D', 'E'].includes(soal.kunci)) {
                    throw new Error(`Kunci jawaban soal nomor ${index + 1} tidak valid`);
                }
            }
            const newSoalContent = soalContent.map((item) => {
                if (bankSoal.jenisUjian === 'Ujian Mandiri') {
                    return { ...item, selected: true };
                }
                if (bankSoal.jenisUjian === 'PAS' || bankSoal.jenisUjian === 'PAT') {
                    return { ...item, selected: !!item.selected };
                }
                return { ...item, selected: false };
            });
            const storagePath = app.makePath('storage/soal_files');
            await mkdir(storagePath, { recursive: true });
            let fileName = bankSoal.soalFile;
            if (!fileName) {
                fileName = `${bankSoal.namaUjian}-${Date.now()}.opz`;
            }
            const filePath = join(storagePath, fileName);
            const encryptedContent = encryption.encrypt(JSON.stringify(newSoalContent, null, 2));
            await writeFile(filePath, encryptedContent);
            bankSoal.soalFile = fileName;
            await bankSoal.save();
            if (request.accepts(['html', 'json']) === 'json') {
                return response.json({
                    success: true,
                    message: 'Soal berhasil disinkronisasi',
                });
            }
            session.flash({
                status: 'success',
                message: 'Konten soal berhasil diperbarui.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, `Gagal update konten soal ${params.id}`);
            if (request.accepts(['html', 'json']) === 'json') {
                return response.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui konten soal',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async editSoal({ inertia, params, response, session }) {
        try {
            const bankSoal = await BankSoal.findOrFail(params.id);
            let soalContent = [];
            if (bankSoal.soalFile) {
                try {
                    const filePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                    const fileContent = await readFile(filePath, 'utf-8');
                    const decryptedContent = encryption.decrypt(fileContent);
                    soalContent =
                        typeof decryptedContent === 'string' ? JSON.parse(decryptedContent) : decryptedContent;
                }
                catch (error) {
                    logger.warn(`Invalid file content for bank soal ${params.id}, initializing empty array`);
                    soalContent = [];
                }
            }
            return inertia.render('BankSoal/EditSoal', {
                bankSoal: bankSoal.serialize(),
                soalContent,
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error(error, `Error editing soal content for bank soal ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memuat konten soal',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async selectedSoal({ inertia, params, response, session }) {
        try {
            const bankSoal = await BankSoal.findOrFail(params.id);
            let soalContent = [];
            if (bankSoal.soalFile) {
                try {
                    const filePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                    const fileContent = await readFile(filePath, 'utf-8');
                    const decryptedContent = encryption.decrypt(fileContent);
                    soalContent =
                        typeof decryptedContent === 'string' ? JSON.parse(decryptedContent) : decryptedContent;
                }
                catch (error) {
                    logger.warn(`Invalid file content for bank soal ${params.id}, initializing empty array`);
                    soalContent = [];
                }
            }
            return inertia.render('BankSoal/SelectedUjian', {
                bankSoal: bankSoal.serialize(),
                soalContent,
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error(error, `Error editing soal content for bank soal ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memuat konten soal',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
}
//# sourceMappingURL=bank_soals_controller.js.map