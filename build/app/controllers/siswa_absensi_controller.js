import DataAbsensi from '#models/data_absensi';
import DataMapel from '#models/data_mapel';
import { DateTime } from 'luxon';
import logger from '@adonisjs/core/services/logger';
export default class SiswaAbsensiController {
    async index({ inertia, session, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            if (!user) {
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
            const absensiData = await DataAbsensi.query()
                .where('user_id', user.id)
                .preload('mapel', (mapel) => mapel.select(['id', 'namaMataPelajaran']))
                .preload('kelas', (kelas) => kelas.select(['id', 'namaKelas']))
                .orderBy('hari', 'desc')
                .orderBy('created_at', 'desc');
            const absensi = absensiData.map((item) => item.toJSON());
            const formattedData = absensi.map((item) => ({
                ...item,
                mapelName: item?.mapel?.namaMataPelajaran || '-',
                kelasName: item?.kelas?.namaKelas || '-',
                tanggal: item.hari ? DateTime.fromISO(item.hari).toFormat('dd/MM/yyyy') : '-',
                hari: item.hari ? DateTime.fromISO(item.hari).toFormat('EEEE', { locale: 'id' }) : '-',
            }));
            const mapelGroups = this.groupByMapel(formattedData);
            return inertia.render('SiswaPage/Absensi', {
                absensi: formattedData,
                mapelGroups,
                totalAbsensi: formattedData.length,
                totalHadir: formattedData.filter((item) => item.status === 'Hadir').length,
                totalTidakHadir: formattedData.filter((item) => item.status !== 'Hadir').length,
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat data absensi siswa');
            session.flash({
                status: 'error',
                message: 'Gagal memuat data absensi',
                error: error,
            });
        }
    }
    async detailMapel({ params, inertia, session, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            if (!user) {
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
            const { mapelId } = params;
            const mapel = await DataMapel.findOrFail(mapelId);
            const absensiData = await DataAbsensi.query()
                .where('user_id', user.id)
                .where('mapel_id', mapelId)
                .preload('mapel', (mapel) => mapel.select(['id', 'namaMataPelajaran']))
                .preload('kelas', (kelas) => kelas.select(['id', 'namaKelas']))
                .orderBy('hari', 'desc');
            const absensi = absensiData.map((item) => item.toJSON());
            const formattedData = absensi.map((item) => ({
                ...item,
                mapelName: item?.mapel?.namaMataPelajaran || '-',
                kelasName: item?.kelas?.namaKelas || '-',
                tanggal: item.hari ? DateTime.fromISO(item.hari).toFormat('dd/MM/yyyy') : '-',
                hari: item.hari ? DateTime.fromISO(item.hari).toFormat('EEEE', { locale: 'id' }) : '-',
                bulan: item.hari
                    ? DateTime.fromISO(item.hari).toFormat('MMMM yyyy', { locale: 'id' })
                    : '-',
            }));
            const totalPertemuan = formattedData.length;
            const totalHadir = formattedData.filter((item) => item.status === 'Hadir').length;
            const totalTidakHadir = formattedData.filter((item) => item.status !== 'Hadir').length;
            const persentaseKehadiran = totalPertemuan > 0 ? Math.round((totalHadir / totalPertemuan) * 100) : 0;
            return inertia.render('SiswaPage/DetailAbsensi', {
                absensi: formattedData,
                mapel: mapel.toJSON(),
                statistik: {
                    totalPertemuan,
                    totalHadir,
                    totalTidakHadir,
                    persentaseKehadiran,
                },
                session: session.flashMessages.all(),
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat detail absensi mata pelajaran');
            session.flash({
                status: 'error',
                message: 'Gagal memuat data absensi',
                error: error,
            });
        }
    }
    groupByMapel(absensiData) {
        const groups = {};
        absensiData.forEach((item) => {
            const mapelId = item.mapelId;
            const mapelName = item.mapelName;
            if (!groups[mapelId]) {
                groups[mapelId] = {
                    id: mapelId,
                    namaMapel: mapelName,
                    totalAbsensi: 0,
                    totalHadir: 0,
                    totalTidakHadir: 0,
                    persentaseKehadiran: 0,
                    absensiList: [],
                };
            }
            groups[mapelId].absensiList.push(item);
            groups[mapelId].totalAbsensi++;
            if (item.status === 'Hadir') {
                groups[mapelId].totalHadir++;
            }
            else {
                groups[mapelId].totalTidakHadir++;
            }
            groups[mapelId].persentaseKehadiran =
                groups[mapelId].totalAbsensi > 0
                    ? Math.round((groups[mapelId].totalHadir / groups[mapelId].totalAbsensi) * 100)
                    : 0;
        });
        return Object.values(groups);
    }
}
//# sourceMappingURL=siswa_absensi_controller.js.map