import BankSoal from '#models/bank_soal';
import DataKelas from '#models/data_kelas';
import ManajemenKehadiran from '#models/manajemen_kehadiran';
import app from '@adonisjs/core/services/app';
import encryption from '@adonisjs/core/services/encryption';
import logger from '@adonisjs/core/services/logger';
import { DateTime } from 'luxon';
import fs, { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import ExcelJS from 'exceljs';
export default class DataJawabansController {
    async index({ request, inertia, session, auth }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const namaUjian = request.input('nama_ujian', '');
        const path = request.parsedUrl.pathname;
        const segments = path?.split('/').filter(Boolean);
        const lastSegment = segments?.at(-1);
        const [totalKehadiran] = await Promise.all([
            ManajemenKehadiran.query().count('* as total').first(),
        ]);
        const query = ManajemenKehadiran.query()
            .preload('user', (user) => user.preload('dataSiswa'))
            .preload('ujian', (u) => {
            u.preload('mapel');
        });
        if (search) {
            query.whereHas('user', (userQuery) => {
                userQuery.where('full_name', 'LIKE', `%${search}%`);
            });
        }
        if (namaUjian) {
            query.whereHas('ujian', (ujianQuery) => {
                ujianQuery.where('id', `${namaUjian}`);
            });
        }
        const kehadiranPaginate = await query
            .orderBy('created_at', 'desc')
            .paginate(page, search ? Number(totalKehadiran?.$extras.total) || 1 : 15);
        const kehadiransWithStats = await Promise.all(kehadiranPaginate.all().map(async (kehadiran) => {
            const kehadiranData = kehadiran.toJSON();
            try {
                const bankSoal = await BankSoal.find(kehadiran.ujianId);
                let totalSoal = 0;
                let terjawab = 0;
                if (bankSoal && bankSoal.soalFile) {
                    const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                    const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
                    const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
                    const soalArray = typeof decryptedSoalContent === 'string'
                        ? JSON.parse(decryptedSoalContent)
                        : decryptedSoalContent;
                    totalSoal = soalArray.filter((item) => item.selected && item.selected == true).length;
                    if (kehadiran.jawabanFile) {
                        const jawabanFilePath = join(app.makePath('storage/jawaban'), kehadiran.jawabanFile);
                        const encryptedJawabanContent = await readFile(jawabanFilePath, 'utf-8');
                        const decryptedJawabanContent = encryption.decrypt(encryptedJawabanContent);
                        const jawabanArray = typeof decryptedJawabanContent === 'string'
                            ? JSON.parse(decryptedJawabanContent)
                            : decryptedJawabanContent;
                        const jawabanObj = Array.isArray(jawabanArray) ? jawabanArray[0] : jawabanArray;
                        terjawab = Object.values(jawabanObj).filter((j) => j && j.trim() !== '').length;
                    }
                }
                let status = 'Belum Mulai';
                if (terjawab > 0) {
                    status = terjawab === totalSoal ? 'Selesai' : 'Dalam Pengerjaan';
                }
                return {
                    ...kehadiranData,
                    totalSoal,
                    terjawab,
                    tidakTerjawab: totalSoal - terjawab,
                    perbandingan: `${terjawab}/${totalSoal}`,
                    status,
                    progress: totalSoal > 0 ? Math.round((terjawab / totalSoal) * 100) : 0,
                };
            }
            catch (error) {
                logger.error({ err: error }, `Error processing kehadiran ${kehadiran.id}`);
                return {
                    ...kehadiranData,
                    totalSoal: 0,
                    terjawab: 0,
                    tidakTerjawab: 0,
                    status: 'Error',
                    progress: 0,
                };
            }
        }));
        const listUjian = await BankSoal.query().preload('mapel');
        await auth.check();
        let renderFE = lastSegment == 'manajemen-kehadiran' ? 'Kehadiran/Index' : 'Nilai/Index';
        return inertia.render(renderFE, {
            kehadiranPaginate: {
                currentPage: kehadiranPaginate.currentPage,
                lastPage: kehadiranPaginate.lastPage,
                total: kehadiranPaginate.total,
                perPage: kehadiranPaginate.perPage,
                firstPage: 1,
                nextPage: kehadiranPaginate.currentPage < kehadiranPaginate.lastPage
                    ? kehadiranPaginate.currentPage + 1
                    : null,
                previousPage: kehadiranPaginate.currentPage > 1 ? kehadiranPaginate.currentPage - 1 : null,
            },
            kehadirans: kehadiransWithStats,
            session: session.flashMessages.all(),
            searchQuery: search,
            namaUjianFilter: namaUjian,
            listUjian,
            auth: auth.user,
        });
    }
    async indexGuru({ request, inertia, session, auth }) {
        await auth.check();
        const user = auth.user;
        await user.load('dataGuru');
        const nip = user.dataGuru.nip;
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const namaUjian = request.input('nama_ujian', '');
        const dataKelas = await DataKelas.query().whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [
            `"${nip}"`,
        ]);
        const nisnDiampu = [];
        dataKelas.forEach((kelas) => {
            try {
                const siswaArray = JSON.parse(kelas.siswa || '[]');
                nisnDiampu.push(...siswaArray);
            }
            catch (error) {
                logger.error({ err: error }, `Error parsing siswa data for kelas ${kelas.id}`);
            }
        });
        const totalQuery = ManajemenKehadiran.query().whereHas('user', (userQuery) => {
            userQuery.whereHas('dataSiswa', (siswaQuery) => {
                siswaQuery.whereIn('nisn', nisnDiampu);
            });
        });
        const [totalKehadiran] = await Promise.all([totalQuery.count('* as total').first()]);
        const query = ManajemenKehadiran.query()
            .preload('user', (user) => {
            user.preload('dataSiswa');
        })
            .preload('ujian', (u) => {
            u.preload('mapel');
        })
            .whereHas('user', (userQuery) => {
            userQuery.whereHas('dataSiswa', (siswaQuery) => {
                siswaQuery.whereIn('nisn', nisnDiampu);
            });
        });
        if (search) {
            query.whereHas('user', (userQuery) => {
                userQuery.where('full_name', 'LIKE', `%${search}%`);
            });
        }
        if (namaUjian) {
            query.whereHas('ujian', (ujianQuery) => {
                ujianQuery.where('id', `${namaUjian}`);
            });
        }
        const kehadiranPaginate = await query
            .orderBy('created_at', 'desc')
            .paginate(page, search ? Number(totalKehadiran?.$extras.total) || 1 : 15);
        const kehadiransWithStats = await Promise.all(kehadiranPaginate.all().map(async (kehadiran) => {
            const kehadiranData = kehadiran.toJSON();
            try {
                const bankSoal = await BankSoal.find(kehadiran.ujianId);
                let totalSoal = 0;
                let terjawab = 0;
                if (bankSoal && bankSoal.soalFile) {
                    const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                    const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
                    const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
                    const soalArray = typeof decryptedSoalContent === 'string'
                        ? JSON.parse(decryptedSoalContent)
                        : decryptedSoalContent;
                    totalSoal = soalArray.filter((item) => item.selected && item.selected == true).length;
                    if (kehadiran.jawabanFile) {
                        const jawabanFilePath = join(app.makePath('storage/jawaban'), kehadiran.jawabanFile);
                        const encryptedJawabanContent = await readFile(jawabanFilePath, 'utf-8');
                        const decryptedJawabanContent = encryption.decrypt(encryptedJawabanContent);
                        const jawabanArray = typeof decryptedJawabanContent === 'string'
                            ? JSON.parse(decryptedJawabanContent)
                            : decryptedJawabanContent;
                        terjawab = jawabanArray.filter((jawaban) => jawaban.jawaban && jawaban.jawaban.trim() !== '').length;
                    }
                }
                let status = 'Belum Mulai';
                if (terjawab > 0) {
                    status = terjawab === totalSoal ? 'Selesai' : 'Dalam Pengerjaan';
                }
                return {
                    ...kehadiranData,
                    totalSoal,
                    terjawab,
                    tidakTerjawab: totalSoal - terjawab,
                    perbandingan: `${terjawab}/${totalSoal}`,
                    status,
                    progress: totalSoal > 0 ? Math.round((terjawab / totalSoal) * 100) : 0,
                };
            }
            catch (error) {
                logger.error({ err: error }, `Error processing kehadiran ${kehadiran.id}`);
                return {
                    ...kehadiranData,
                    totalSoal: 0,
                    terjawab: 0,
                    tidakTerjawab: 0,
                    status: 'Error',
                    progress: 0,
                };
            }
        }));
        const listUjian = await BankSoal.query()
            .preload('mapel')
            .whereRaw('JSON_CONTAINS(penulis, ?)', [`"${user.id}"`]);
        return inertia.render('Kehadiran/Index', {
            kehadiranPaginate: {
                currentPage: kehadiranPaginate.currentPage,
                lastPage: kehadiranPaginate.lastPage,
                total: kehadiranPaginate.total,
                perPage: kehadiranPaginate.perPage,
                firstPage: 1,
                nextPage: kehadiranPaginate.currentPage < kehadiranPaginate.lastPage
                    ? kehadiranPaginate.currentPage + 1
                    : null,
                previousPage: kehadiranPaginate.currentPage > 1 ? kehadiranPaginate.currentPage - 1 : null,
            },
            kehadirans: kehadiransWithStats,
            session: session.flashMessages.all(),
            searchQuery: search,
            namaUjianFilter: namaUjian,
            listUjian,
            auth: auth.user,
        });
    }
    async indexSiswa({ request, response, inertia, session, auth }) {
        await auth.check();
        const user = auth.user;
        if (!user) {
            response.redirect().toPath('/login');
            session.flash({
                status: 'error',
                message: 'Anda harus login untuk mengakses halaman ini',
            });
        }
        await user.load('dataSiswa');
        if (!user.dataSiswa) {
            session.flash({
                status: 'error',
                message: 'Akses ditolak. Hanya untuk siswa.',
            });
        }
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const namaUjian = request.input('nama_ujian', '');
        const query = ManajemenKehadiran.query()
            .where('user_id', user.id)
            .preload('user', (user) => user.preload('dataSiswa'))
            .preload('ujian', (u) => {
            u.preload('mapel');
        });
        if (search) {
            query.whereHas('ujian', (ujianQuery) => {
                ujianQuery.where('nama_ujian', 'LIKE', `%${search}%`);
            });
        }
        if (namaUjian) {
            query.whereHas('ujian', (ujianQuery) => {
                ujianQuery.where('id', `${namaUjian}`);
            });
        }
        const totalQuery = ManajemenKehadiran.query().where('user_id', user.id);
        const [totalKehadiran] = await Promise.all([totalQuery.count('* as total').first()]);
        const kehadiranPaginate = await query
            .orderBy('created_at', 'desc')
            .paginate(page, search ? Number(totalKehadiran?.$extras.total) || 1 : 15);
        const kehadiransWithStats = await Promise.all(kehadiranPaginate.all().map(async (kehadiran) => {
            const kehadiranData = kehadiran.toJSON();
            try {
                const bankSoal = await BankSoal.find(kehadiran.ujianId);
                let totalSoal = 0;
                let terjawab = 0;
                if (bankSoal && bankSoal.soalFile) {
                    const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                    const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
                    const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
                    const soalArray = typeof decryptedSoalContent === 'string'
                        ? JSON.parse(decryptedSoalContent)
                        : decryptedSoalContent;
                    totalSoal = soalArray.filter((item) => item.selected && item.selected == true).length;
                    if (kehadiran.jawabanFile) {
                        const jawabanFilePath = join(app.makePath('storage/jawaban'), kehadiran.jawabanFile);
                        const encryptedJawabanContent = await readFile(jawabanFilePath, 'utf-8');
                        const decryptedJawabanContent = encryption.decrypt(encryptedJawabanContent);
                        const jawabanArray = typeof decryptedJawabanContent === 'string'
                            ? JSON.parse(decryptedJawabanContent)
                            : decryptedJawabanContent;
                        if (Array.isArray(jawabanArray)) {
                            terjawab = jawabanArray.filter((jawaban) => jawaban.jawaban && jawaban.jawaban.trim() !== '').length;
                        }
                        else if (typeof jawabanArray === 'object') {
                            terjawab = Object.values(jawabanArray).filter((j) => j && j.trim() !== '').length;
                        }
                    }
                }
                let status = 'Belum Mulai';
                if (terjawab > 0) {
                    status = terjawab === totalSoal ? 'Selesai' : 'Dalam Pengerjaan';
                }
                return {
                    ...kehadiranData,
                    totalSoal,
                    terjawab,
                    tidakTerjawab: totalSoal - terjawab,
                    perbandingan: `${terjawab}/${totalSoal}`,
                    status,
                    progress: totalSoal > 0 ? Math.round((terjawab / totalSoal) * 100) : 0,
                };
            }
            catch (error) {
                logger.error({ err: error }, `Error processing kehadiran ${kehadiran.id}`);
                return {
                    ...kehadiranData,
                    totalSoal: 0,
                    terjawab: 0,
                    tidakTerjawab: 0,
                    status: 'Error',
                    progress: 0,
                };
            }
        }));
        const listUjian = await BankSoal.query().preload('mapel');
        return inertia.render('SiswaPage/RiwayatUjian', {
            kehadiranPaginate: {
                currentPage: kehadiranPaginate.currentPage,
                lastPage: kehadiranPaginate.lastPage,
                total: kehadiranPaginate.total,
                perPage: kehadiranPaginate.perPage,
                firstPage: 1,
                nextPage: kehadiranPaginate.currentPage < kehadiranPaginate.lastPage
                    ? kehadiranPaginate.currentPage + 1
                    : null,
                previousPage: kehadiranPaginate.currentPage > 1 ? kehadiranPaginate.currentPage - 1 : null,
            },
            kehadirans: kehadiransWithStats,
            session: session.flashMessages.all(),
            searchQuery: search,
            namaUjianFilter: namaUjian,
            listUjian,
            auth: auth.user,
        });
    }
    async export({ response, request }) {
        const mapelFilter = request.input('mapel', '');
        const data = await ManajemenKehadiran.query()
            .preload('user', (q) => q.preload('dataSiswa'))
            .preload('ujian', (q) => q.preload('mapel', (m) => {
            if (mapelFilter) {
                m.where('nama', 'LIKE', `%${mapelFilter}%`);
            }
        }));
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Rapor Nilai');
        worksheet.columns = [
            { header: 'Nama Siswa', key: 'nama', width: 25 },
            { header: 'NISN', key: 'nisn', width: 15 },
            { header: 'Mata Pelajaran', key: 'mapel', width: 25 },
            { header: 'Nilai', key: 'nilai', width: 10 },
            { header: 'Predikat', key: 'predikat', width: 12 },
        ];
        for (const item of data) {
            const nama = item.user?.fullName ?? '-';
            const nisn = item.user?.dataSiswa?.nisn ?? '-';
            const mapel = item.ujian?.mapel?.namaMataPelajaran ?? '-';
            let nilai = 0;
            try {
                nilai = parseInt(item.skor);
            }
            catch {
                nilai = 0;
            }
            const predikat = nilai >= 90 ? 'A' : nilai >= 80 ? 'B' : nilai >= 70 ? 'C' : nilai >= 60 ? 'D' : 'E';
            worksheet.addRow({ nama, nisn, mapel, nilai, predikat });
        }
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).alignment = { horizontal: 'center' };
        response.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.header('Content-Disposition', `attachment; filename="rapor_${DateTime.now().toFormat('yyyyLLdd_HHmm')}.xlsx"`);
        const buffer = await workbook.xlsx.writeBuffer();
        return response.send(buffer);
    }
    async previewJawaban({ params, response, auth, inertia, session }) {
        try {
            await auth.check();
            if (!auth.user) {
                return response.redirect().toRoute('siswa.login');
            }
            const { id } = params;
            const kehadiran = await ManajemenKehadiran.query()
                .where('id', id)
                .where('user_id', auth.user.id)
                .preload('user', (user) => user.preload('dataSiswa'))
                .preload('ujian', (query) => {
                query.preload('mapel');
            })
                .firstOrFail();
            if (!kehadiran.jawabanFile) {
                return response.redirect().back();
            }
            const jawabanFilePath = join(app.makePath('storage/jawaban'), kehadiran.jawabanFile);
            const encryptedJawabanContent = await readFile(jawabanFilePath, 'utf-8');
            const decryptedJawabanContent = encryption.decrypt(encryptedJawabanContent);
            let jawabanSiswa = {};
            if (decryptedJawabanContent) {
                jawabanSiswa =
                    typeof decryptedJawabanContent === 'string'
                        ? JSON.parse(decryptedJawabanContent)
                        : decryptedJawabanContent;
            }
            const bankSoal = await BankSoal.findOrFail(kehadiran.ujianId);
            let soalData = [];
            if (bankSoal.soalFile) {
                const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
                const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
                if (decryptedSoalContent) {
                    soalData =
                        typeof decryptedSoalContent === 'string'
                            ? JSON.parse(decryptedSoalContent)
                            : decryptedSoalContent;
                }
            }
            const formattedJawaban = this.formatJawabanData(soalData, jawabanSiswa).filter((item) => item.selected && item.selected == true);
            return inertia.render('SiswaPage/PreviewJawaban', {
                jawabanData: formattedJawaban,
                kehadiran: kehadiran.toJSON(),
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal memuat jawaban siswa`);
            return response.redirect().back();
        }
    }
    formatJawabanData(soalData, jawabanSiswa) {
        if (Array.isArray(jawabanSiswa) && jawabanSiswa.length > 0 && jawabanSiswa[0].soal) {
            return jawabanSiswa;
        }
        if (typeof jawabanSiswa === 'object' && jawabanSiswa !== null && !Array.isArray(jawabanSiswa)) {
            return Object.entries(jawabanSiswa).map(([soalId, jawaban]) => {
                const soal = Array.isArray(soalData)
                    ? soalData.find((s) => s.id === soalId || s.id?.toString() === soalId || s.id === parseInt(soalId))
                    : null;
                const optionsJawaban = [soal.A, soal.B, soal.C, soal.D, soal.E];
                return {
                    id: soalId,
                    soal: soal?.soal || soal?.pertanyaan || `Soal ${soalId}`,
                    jawaban: jawaban,
                    selected: soal.selected,
                    type: soal?.type || 'pilihan_ganda',
                    options: optionsJawaban || [],
                };
            });
        }
        return [];
    }
    async ujian({ inertia, session }) {
        const bankSoals = await BankSoal.query().orderBy('created_at', 'desc');
        return inertia.render('Kehadiran/Create', {
            bankSoals: bankSoals.map((item) => item.toJSON()),
            session: session.flashMessages.all(),
        });
    }
    async startUjian({ request, response, session, auth }) {
        try {
            const { ujianId } = request.only(['ujianId']);
            await auth.check();
            const user = auth.user;
            const existingKehadiran = await ManajemenKehadiran.query()
                .where('user_id', user.id)
                .where('ujian_id', ujianId)
                .first();
            if (existingKehadiran) {
                session.flash({
                    status: 'error',
                    message: 'Anda sudah mengikuti ujian ini.',
                });
                return response.redirect().back();
            }
            const bankSoal = await BankSoal.findOrFail(ujianId);
            const soalFilePath = bankSoal.soalFile;
            const filePath = app.makePath(`storage/soal_files/${soalFilePath}`);
            try {
                await fs.access(filePath);
            }
            catch {
                throw new Error(`File soal tidak ditemukan: ${soalFilePath}`);
            }
            const encryptedSoalContent = await fs.readFile(filePath, 'utf-8');
            const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
            if (!decryptedSoalContent) {
                throw new Error('Gagal mendecrypt file soal');
            }
            const soalArray = typeof decryptedSoalContent === 'string'
                ? JSON.parse(decryptedSoalContent)
                : decryptedSoalContent;
            const jawabanKosong = soalArray.map((soal) => ({
                id: soal.id,
                soal: soal.soal || soal.pertanyaan,
                jawaban: '',
            }));
            const encryptedJawaban = encryption.encrypt(JSON.stringify(jawabanKosong));
            const fileName = `${user.id}-${bankSoal.id}-${Date.now()}.opz`;
            const filePathJawaban = join(app.makePath('storage/jawaban'), fileName);
            await mkdir(app.makePath('storage/jawaban'), { recursive: true });
            await writeFile(filePathJawaban, encryptedJawaban);
            await ManajemenKehadiran.create({
                userId: user.id,
                ujianId: bankSoal.id,
                skor: '0',
                benar: '0',
                salah: '0',
                jawabanFile: fileName,
            });
            session.flash({
                status: 'success',
                message: 'Ujian berhasil dimulai!',
            });
            return response.redirect().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memulai ujian');
            session.flash({
                status: 'error',
                message: 'Gagal memulai ujian',
                error: error,
            });
            return response.redirect().back();
        }
    }
    async submitJawaban({ request, response, session, auth, params }) {
        try {
            const { jawaban } = request.only(['jawaban']);
            await auth.check();
            const user = auth.user;
            const ujianId = params.id;
            const kehadiran = await ManajemenKehadiran.query()
                .where('user_id', user.id)
                .where('ujian_id', ujianId)
                .firstOrFail();
            const bankSoal = await BankSoal.findOrFail(ujianId);
            const soalData = bankSoal.decryptSoalFile();
            const soalArray = typeof soalData === 'string' ? JSON.parse(soalData) : soalData;
            const updatedJawaban = soalArray.map((soal) => {
                const jawabanSiswa = jawaban.find((j) => j.id === soal.id);
                return {
                    id: soal.id,
                    soal: soal.soal || soal.pertanyaan,
                    jawaban: jawabanSiswa?.jawaban || '',
                };
            });
            let benar = 0;
            let salah = 0;
            const encryptedJawaban = encryption.encrypt(JSON.stringify(updatedJawaban));
            kehadiran.merge({
                jawabanFile: encryptedJawaban,
                benar: benar.toString(),
                salah: salah.toString(),
                skor: ((benar / soalArray.length) * 100).toString(),
            });
            await kehadiran.save();
            session.flash({
                status: 'success',
                message: 'Jawaban berhasil disimpan!',
            });
            return response.redirect().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal menyimpan jawaban');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan jawaban',
                error: error,
            });
            return response.redirect().back();
        }
    }
    async getFileContent({ request, response }) {
        try {
            const { id } = request.params();
            const Jawaban = await ManajemenKehadiran.findOrFail(id);
            if (!Jawaban.jawabanFile) {
                return response.status(404).json({
                    success: false,
                    message: 'File soal tidak ditemukan',
                });
            }
            const filePath = join(app.makePath('storage/jawaban'), Jawaban.jawabanFile);
            const fileContent = await readFile(filePath, 'utf-8');
            const decryptedContent = encryption.decrypt(fileContent);
            return response.json({
                success: true,
                data: typeof decryptedContent === 'string' ? JSON.parse(decryptedContent) : decryptedContent,
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
}
//# sourceMappingURL=data_jawabans_controller.js.map