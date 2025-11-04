import BankSoal from '#models/bank_soal';
import DataJurusan from '#models/data_jurusan';
import DataKelas from '#models/data_kelas';
import DataSiswa from '#models/data_siswa';
import ManajemenKehadiran from '#models/manajemen_kehadiran';
import { readFile, writeFile, mkdir } from 'fs/promises';
import encryption from '@adonisjs/core/services/encryption';
import logger from '@adonisjs/core/services/logger';
import { DateTime } from 'luxon';
import { join } from 'path';
import app from '@adonisjs/core/services/app';
import DataPembayaran from '#models/data_pembayaran';
import DataWebsite from '#models/data_website';
export default class UjiansController {
    async jadwalUjian({ response, inertia, auth, session }) {
        const user = auth.user;
        const siswa = await DataSiswa.findBy('user_id', user.id);
        if (!siswa) {
            await auth.use('web').logout();
            return response.redirect().toPath('/login');
        }
        const semuaKelas = await DataKelas.all();
        const kelasSiswa = semuaKelas.find((kelas) => {
            try {
                const siswaArray = typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa;
                return siswaArray.includes(siswa.nisn);
            }
            catch {
                return false;
            }
        });
        if (!kelasSiswa) {
            return inertia.render('SiswaPage/JadwalUjian', {
                bankSoal: [],
                error: 'Kelas siswa tidak ditemukan',
                session: session.flashMessages.all(),
            });
        }
        const semuaJurusan = await DataJurusan.all();
        const jurusanSiswa = semuaJurusan.find((jurusan) => {
            return jurusan.kelasId.includes(kelasSiswa.id);
        });
        const bankSoal = await BankSoal.query()
            .preload('mapel')
            .where('jenjang', kelasSiswa.jenjang)
            .andWhereRaw('JSON_CONTAINS(jurusan, ?)', [`"${jurusanSiswa?.id}"`])
            .andWhereRaw('DATE(tanggal_ujian) = ?', [DateTime.now().toISODate()])
            .orderBy('tanggal_ujian', 'asc');
        return inertia.render('SiswaPage/JadwalUjian', {
            bankSoal,
            session: session.flashMessages.all(),
        });
    }
    async mulaiUjian({ params, inertia, auth, response, session }) {
        try {
            await auth.check();
            const user = auth.user;
            const ujianId = params.id;
            const existingKehadiran = await ManajemenKehadiran.query()
                .where('user_id', user.id)
                .where('ujian_id', ujianId)
                .first();
            const dataWebsite = await DataWebsite.getAllSettings();
            const cekPembayarn = await DataPembayaran.query().where('user_id', user.id);
            const tagihan = cekPembayarn.map((item) => item.toJSON());
            let MasihAdaTagihan = false;
            console.log('Masih Ada Tagihan', MasihAdaTagihan);
            tagihan.map((item) => {
                const nominalBayarArray = this.safeJsonParse(item.nominalBayar);
                const totalDibayar = this.calculateTotalDibayar(nominalBayarArray);
                const nominalPenetapan = parseFloat(item.nominalPenetapan || '0');
                const sisaPembayaran = nominalPenetapan - totalDibayar;
                if (sisaPembayaran > 0 && !item.partisipasiUjian) {
                    MasihAdaTagihan = true;
                }
            });
            if (existingKehadiran?.skor && parseInt(existingKehadiran?.skor) > 0) {
                response.redirect().toPath('/siswa/jadwalujian');
                session.flash({
                    status: 'error',
                    message: 'Anda Sudah Mengikuti Ujian Ini!',
                });
            }
            if (MasihAdaTagihan) {
                response.redirect().toPath('/siswa/jadwalujian');
                session.flash({
                    status: 'error',
                    message: 'Anda Masih Ada Tagihan Pembayaran!',
                });
            }
            if (existingKehadiran) {
                const bankSoal = await BankSoal.findOrFail(ujianId);
                const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
                const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
                const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
                if (!decryptedSoalContent) {
                    throw new Error('Gagal mendecrypt file soal');
                }
                const soalArray = typeof decryptedSoalContent == 'string'
                    ? JSON.parse(decryptedSoalContent)
                    : decryptedSoalContent;
                const soalFormatted = soalArray
                    .filter((item) => item.selected && item.selected == true)
                    .map((soal, index) => ({
                    id: soal.id || `soal-${index + 1}`,
                    nomor: index + 1,
                    pertanyaan: soal.soal,
                    pilihan: [
                        {
                            label: soal.A,
                            value: 'A',
                        },
                        {
                            label: soal.B,
                            value: 'B',
                        },
                        {
                            label: soal.C,
                            value: 'C',
                        },
                        {
                            label: soal.D,
                            value: 'D',
                        },
                        {
                            label: soal.E,
                            value: 'E',
                        },
                    ],
                    jawabanBenar: soal.kunci,
                    gambar: soal.gambar || null,
                }));
                const jawabanArray = join(app.makePath('storage/jawaban'), existingKehadiran.jawabanFile);
                const encryptedJawabanArrayContent = await readFile(jawabanArray, 'utf-8');
                const decryptedJawabanContent = encryption.decrypt(encryptedJawabanArrayContent);
                const jawabans = typeof decryptedJawabanContent == 'string'
                    ? JSON.parse(decryptedJawabanContent)
                    : decryptedJawabanContent;
                return inertia.render('SiswaPage/Ujian', {
                    ujianId,
                    kehadiranId: existingKehadiran.id,
                    bankSoal: {
                        id: bankSoal.id,
                        namaUjian: bankSoal.namaUjian,
                        waktu: parseInt(bankSoal.waktu),
                        totalSoal: soalArray.length,
                    },
                    soalList: soalFormatted,
                    jawabanList: jawabans,
                    dataWebsite,
                    user: user,
                    session: session.flashMessages.all(),
                });
            }
            const bankSoal = await BankSoal.findOrFail(ujianId);
            const now = new Date();
            const waktuUjian = new Date(bankSoal.tanggalUjian);
            if (now < waktuUjian) {
                session.flash({
                    status: 'error',
                    message: 'Ujian belum dimulai',
                });
                return response.redirect().withQs().back();
            }
            const waktuSelesai = new Date(waktuUjian.getTime() + parseInt(bankSoal.waktu) * 60000);
            if (now > waktuSelesai) {
                session.flash({
                    status: 'error',
                    message: 'Ujian sudah berakhir',
                });
                return response.redirect().withQs().back();
            }
            const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
            const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
            const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
            if (!decryptedSoalContent) {
                throw new Error('Gagal mendecrypt file soal');
            }
            const soalArray = typeof decryptedSoalContent == 'string'
                ? JSON.parse(decryptedSoalContent)
                : decryptedSoalContent;
            const soalFormatted = soalArray
                .filter((item) => item.selected && item.selected == true)
                .map((soal, index) => ({
                id: soal.id || `soal-${index + 1}`,
                nomor: index + 1,
                pertanyaan: soal.soal,
                pilihan: [
                    {
                        label: soal.A,
                        value: 'A',
                    },
                    {
                        label: soal.B,
                        value: 'B',
                    },
                    {
                        label: soal.C,
                        value: 'C',
                    },
                    {
                        label: soal.D,
                        value: 'D',
                    },
                    {
                        label: soal.E,
                        value: 'E',
                    },
                ],
                jawabanBenar: soal.kunci,
                gambar: soal.gambar || null,
            }));
            const jawabanKosong = soalArray.map((soal) => ({
                [soal.id]: '',
            }));
            const encryptedJawaban = encryption.encrypt(JSON.stringify(jawabanKosong));
            const fileName = `${user.id}-${bankSoal.id}-${Date.now()}.opz`;
            const filePathJawaban = join(app.makePath('storage/jawaban'), fileName);
            await mkdir(app.makePath('storage/jawaban'), { recursive: true });
            await writeFile(filePathJawaban, encryptedJawaban);
            const kehadiran = await ManajemenKehadiran.create({
                userId: user.id,
                ujianId: bankSoal.id,
                skor: '0',
                benar: '0',
                salah: '0',
                jawabanFile: fileName,
            });
            return inertia.render('SiswaPage/Ujian', {
                ujianId,
                kehadiranId: kehadiran.id,
                bankSoal: {
                    id: bankSoal.id,
                    namaUjian: bankSoal.namaUjian,
                    waktu: parseInt(bankSoal.waktu),
                    totalSoal: soalArray.length,
                },
                soalList: soalFormatted,
                jawabanList: jawabanKosong,
                dataWebsite,
                user: user,
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memulai ujian');
            session.flash({
                status: 'error',
                message: 'Gagal memulai ujian',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async saveJawaban({ params, request, auth, response, session }) {
        try {
            const ujianId = params.id;
            await auth.check();
            const user = auth.user;
            const [jawaban] = [request.body()];
            const existingKehadiran = await ManajemenKehadiran.query()
                .where('user_id', user.id)
                .where('ujian_id', ujianId)
                .firstOrFail();
            const filePath = join(app.makePath('storage/jawaban'), existingKehadiran.jawabanFile);
            const encryptedContent = encryption.encrypt(jawaban);
            await writeFile(filePath, encryptedContent);
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal menyimpan jawaban');
            session.flash({
                status: 'error',
                message: 'Jawaban gagal disimpan! Cek koneksi atau jika nanti mau simpan jawaban harus dalam keadaan online!',
            });
            return response.redirect().withQs().back();
        }
    }
    async submitJawaban({ params, request, auth, response, session }) {
        try {
            const ujianId = params.id;
            await auth.check();
            const user = auth.user;
            let benar = 0;
            let salah = 0;
            const [jawaban] = [request.body()];
            const existingKehadiran = await ManajemenKehadiran.query()
                .where('user_id', user.id)
                .where('ujian_id', ujianId)
                .firstOrFail();
            const bankSoal = await BankSoal.query().where('id', ujianId).firstOrFail();
            const filePath = join(app.makePath('storage/jawaban'), existingKehadiran.jawabanFile);
            const encryptedContent = encryption.encrypt(jawaban);
            await writeFile(filePath, encryptedContent);
            const soalFilePath = join(app.makePath('storage/soal_files'), bankSoal.soalFile);
            const encryptedSoalContent = await readFile(soalFilePath, 'utf-8');
            const decryptedSoalContent = encryption.decrypt(encryptedSoalContent);
            const soals = typeof decryptedSoalContent == 'string'
                ? JSON.parse(decryptedSoalContent)
                : decryptedSoalContent;
            const soalFiletered = soals.filter((item) => item.selected && item.selected == true);
            for (const s of soalFiletered) {
                const jawabanUser = jawaban[s.id];
                if (!jawabanUser)
                    continue;
                if (s.kunci === jawabanUser) {
                    benar++;
                }
                else {
                    salah++;
                }
                existingKehadiran.merge({
                    benar: String(benar),
                    salah: String(salah),
                    skor: String((benar / soalFiletered.length) * 100),
                });
                await existingKehadiran.save();
            }
            session.flash({
                status: 'success',
                message: 'Jawaban berhasil disubmit!',
            });
            return response.redirect().toPath('/siswa/jadwalujian');
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal submit jawaban');
            session.flash({
                status: 'error',
                message: 'Gagal submit jawaban',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    safeJsonParse(jsonString) {
        if (!jsonString) {
            return [];
        }
        try {
            const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            return Array.isArray(parsed) ? parsed : [];
        }
        catch (error) {
            logger.error({ err: error, jsonString }, 'Gagal parse JSON nominalBayar');
            return [];
        }
    }
    calculateTotalDibayar(nominalBayarArray) {
        return nominalBayarArray.reduce((total, bayar) => {
            const nominal = parseFloat(bayar.nominal || '0');
            return total + (isNaN(nominal) ? 0 : nominal);
        }, 0);
    }
}
//# sourceMappingURL=ujians_controller.js.map