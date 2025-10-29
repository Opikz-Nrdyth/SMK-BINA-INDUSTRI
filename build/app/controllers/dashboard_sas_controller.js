import DataAbsensi from '#models/data_absensi';
import DataKelas from '#models/data_kelas';
import DataPembayaran from '#models/data_pembayaran';
import { DateTime } from 'luxon';
import DataSiswa from '#models/data_siswa';
import DataGuru from '#models/data_guru';
import DataMapel from '#models/data_mapel';
import DataWali from '#models/data_wali';
import DataStaf from '#models/data_staf';
import ManajemenKehadiran from '#models/manajemen_kehadiran';
import logger from '@adonisjs/core/services/logger';
import BankSoal from '#models/bank_soal';
import DataAktivita from '#models/data_aktivitas';
import Blog from '#models/blog';
import DataAds from '#models/data_ads';
export default class DashboardSasController {
    async SuperAdmin({ inertia }) {
        try {
            let stats = {
                totalSiswa: 0,
                totalGuru: 0,
                totalKelas: 0,
                totalMapel: 0,
                totalWali: 0,
                totalStaf: 0,
                absensiHariIni: 0,
                trends: {
                    siswa: {
                        value: '',
                        color: '',
                        icon: '',
                        text: '',
                    },
                    guru: {
                        value: '',
                        color: '',
                        icon: '',
                        text: '',
                    },
                    absensi: {
                        value: '',
                        color: '',
                        icon: '',
                        text: '',
                    },
                },
            };
            const [totalSiswa, totalGuru, totalKelas, totalMapel, totalWali, totalStaf] = await Promise.all([
                DataSiswa.query().count('* as total').first(),
                DataGuru.query().count('* as total').first(),
                DataKelas.query().count('* as total').first(),
                DataMapel.query().count('* as total').first(),
                DataWali.query().count('* as total').first(),
                DataStaf.query().count('* as total').first(),
            ]);
            const absensiHariIni = await DataAbsensi.query()
                .where('hari', 'LIKE', `${DateTime.now().toISODate()}%`)
                .count('* as total')
                .first();
            const startOfMonth = DateTime.now().startOf('month');
            const endOfMonth = DateTime.now().endOf('month');
            const absensiBulanIniRaw = await DataAbsensi.query()
                .whereBetween('hari', [startOfMonth.toSQL(), endOfMonth.toSQL()])
                .select('status')
                .count('* as count')
                .groupBy('status');
            const tigaPuluhHariTerakhir = Array.from({ length: 30 }, (_, i) => DateTime.now()
                .minus({ days: 29 - i })
                .toISODate());
            const chartAbsensiData = await Promise.all(tigaPuluhHariTerakhir.map(async (date) => {
                if (!date)
                    return { date: '', total: 0 };
                const absensi = await DataAbsensi.query().where('hari', date).count('* as total');
                return {
                    date: DateTime.fromISO(date).toFormat('dd/MM'),
                    fullDate: date,
                    total: Number(absensi[0]?.$extras.total) || 0,
                };
            }));
            const semuaPembayaran = await DataPembayaran.all();
            const pembayaranByJenis = {};
            semuaPembayaran.forEach((pembayaran) => {
                const jenis = pembayaran.jenisPembayaran;
                const nominal = parseFloat(pembayaran.nominalPenetapan) || 0;
                pembayaranByJenis[jenis] = (pembayaranByJenis[jenis] || 0) + nominal;
            });
            const pembayaranData = Object.entries(pembayaranByJenis)
                .slice(0, 6)
                .map(([jenis, total]) => ({ jenis, total }));
            const semuaKelas = await DataKelas.query()
                .preload('guru', (guru) => guru.preload('user'))
                .then((classes) => classes.slice(0, 6));
            const kelasData = semuaKelas.map((kelas) => ({
                namaKelas: kelas.namaKelas,
                jenjang: kelas.jenjang,
                waliKelas: kelas.guru.user.fullName || kelas.waliKelas || 'Belum ada wali',
            }));
            const statusColors = {
                Hadir: '#10B981',
                Sakit: '#F59E0B',
                Izin: '#3B82F6',
                Alfa: '#EF4444',
                PKL: '#8B5CF6',
            };
            const absensiPieData = absensiBulanIniRaw.map((item) => ({
                status: item.status,
                count: Number(item.$extras.count) || 0,
                color: statusColors[item.status] || '#6B7280',
            }));
            const startOfLastMonth = DateTime.now().minus({ months: 1 }).startOf('month');
            const endOfLastMonth = DateTime.now().minus({ months: 1 }).endOf('month');
            const siswaBulanIni = await DataSiswa.query()
                .whereBetween('createdAt', [startOfMonth.toSQL(), endOfMonth.toSQL()])
                .count('* as total')
                .first();
            const siswaBulanLalu = await DataSiswa.query()
                .whereBetween('createdAt', [startOfLastMonth.toSQL(), endOfLastMonth.toSQL()])
                .count('* as total')
                .first();
            const totalSiswaBulanIni = Number(siswaBulanIni?.$extras.total) || 0;
            const totalSiswaBulanLalu = Number(siswaBulanLalu?.$extras.total) || 0;
            const trendSiswa = totalSiswaBulanLalu > 0
                ? (((totalSiswaBulanIni - totalSiswaBulanLalu) / totalSiswaBulanLalu) * 100).toFixed(1)
                : totalSiswaBulanIni > 0
                    ? '+100'
                    : '0';
            const guruBulanIni = await DataGuru.query()
                .whereBetween('createdAt', [startOfMonth.toSQL(), endOfMonth.toSQL()])
                .count('* as total')
                .first();
            const guruBulanLalu = await DataGuru.query()
                .whereBetween('createdAt', [startOfLastMonth.toSQL(), endOfLastMonth.toSQL()])
                .count('* as total')
                .first();
            const totalGuruBulanIni = Number(guruBulanIni?.$extras.total) || 0;
            const totalGuruBulanLalu = Number(guruBulanLalu?.$extras.total) || 0;
            const trendGuru = totalGuruBulanLalu > 0
                ? (((totalGuruBulanIni - totalGuruBulanLalu) / totalGuruBulanLalu) * 100).toFixed(1)
                : totalGuruBulanIni > 0
                    ? '+100'
                    : '0';
            const kemarin = DateTime.now().minus({ days: 1 }).toISODate();
            const absensiKemarin = await DataAbsensi.query()
                .where('hari', kemarin)
                .count('* as total')
                .first();
            const totalAbsensiKemarin = Number(absensiKemarin?.$extras.total) || 0;
            const trendAbsensi = totalAbsensiKemarin > 0
                ? (((stats.absensiHariIni - totalAbsensiKemarin) / totalAbsensiKemarin) * 100).toFixed(1)
                : stats.absensiHariIni > 0
                    ? '+100'
                    : '0';
            const getTrendColor = (trend) => {
                const trendNum = parseFloat(trend);
                if (trendNum > 0)
                    return 'text-green-600';
                if (trendNum < 0)
                    return 'text-red-600';
                return 'text-gray-600';
            };
            const getTrendIcon = (trend) => {
                const trendNum = parseFloat(trend);
                if (trendNum > 0)
                    return '↗️';
                if (trendNum < 0)
                    return '↘️';
                return '→';
            };
            const getTrendText = (trend, type) => {
                const trendNum = parseFloat(trend);
                Math.abs(trendNum);
                if (type === 'absensi') {
                    if (trendNum > 0)
                        return `dari kemarin`;
                    if (trendNum < 0)
                        return `dari kemarin`;
                    return 'Sama dengan kemarin';
                }
                if (trendNum > 0)
                    return `dari bulan lalu`;
                if (trendNum < 0)
                    return `dari bulan lalu`;
                return 'Stabil dari bulan lalu';
            };
            stats = {
                totalSiswa: Number(totalSiswa?.$extras.total) || 0,
                totalGuru: Number(totalGuru?.$extras.total) || 0,
                totalKelas: Number(totalKelas?.$extras.total) || 0,
                totalMapel: Number(totalMapel?.$extras.total) || 0,
                totalWali: Number(totalWali?.$extras.total) || 0,
                totalStaf: Number(totalStaf?.$extras.total) || 0,
                absensiHariIni: Number(absensiHariIni?.$extras.total) ?? 0,
                trends: {
                    siswa: {
                        value: trendSiswa,
                        color: getTrendColor(trendSiswa),
                        icon: getTrendIcon(trendSiswa),
                        text: getTrendText(trendSiswa, 'siswa'),
                    },
                    guru: {
                        value: trendGuru,
                        color: getTrendColor(trendGuru),
                        icon: getTrendIcon(trendGuru),
                        text: getTrendText(trendGuru, 'guru'),
                    },
                    absensi: {
                        value: trendAbsensi,
                        color: getTrendColor(trendAbsensi),
                        icon: getTrendIcon(trendAbsensi),
                        text: getTrendText(trendAbsensi, 'absensi'),
                    },
                },
            };
            return inertia.render('Dashboard/SuperAdmin', {
                stats,
                chartData: {
                    absensiTrend: chartAbsensiData,
                    absensiPie: absensiPieData,
                },
                pembayaranData,
                kelasData,
            });
        }
        catch (error) {
            console.error('Dashboard error:', error);
            return inertia.render('Dashboard/SuperAdmin', {
                stats: {
                    totalSiswa: 1,
                    totalGuru: 0,
                    totalKelas: 0,
                    totalMapel: 0,
                    totalWali: 0,
                    totalStaf: 0,
                    absensiHariIni: 0,
                },
                chartData: {
                    absensiTrend: [],
                    absensiPie: [],
                },
                pembayaranData: [],
                kelasData: [],
            });
        }
    }
    async Guru({ inertia, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            await user.load('dataGuru');
            const nip = user.dataGuru.nip;
            const kelasDiampu = await DataKelas.query()
                .whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [`"${nip}"`])
                .orWhere('waliKelas', nip);
            const nisnDiampu = new Map();
            const kelasMap = new Map();
            kelasDiampu.forEach((kelas) => {
                const siswaArray = typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa) : kelas.siswa;
                if (!kelasMap.has(kelas.namaKelas)) {
                    kelasMap.set(kelas.namaKelas, {
                        namaKelas: kelas.namaKelas,
                        jumlahSiswa: 0,
                    });
                }
                siswaArray.forEach((nisn) => {
                    nisnDiampu.set(nisn, kelas.namaKelas);
                    const kelasData = kelasMap.get(kelas.namaKelas);
                    kelasData.jumlahSiswa++;
                });
            });
            const totalSiswaDiampu = nisnDiampu.size;
            const totalKelasDiampu = kelasMap.size;
            const mapelDiampu = await DataMapel.query().whereRaw('JSON_CONTAINS(guru_ampu, ?)', [
                `"${nip}"`,
            ]);
            const totalMapelDiampu = mapelDiampu.length;
            const absensiHariIni = await DataAbsensi.query()
                .where('hari', 'LIKE', `${DateTime.now().toISODate()}%`)
                .whereIn('userId', (query) => {
                query.from('data_siswas').select('user_id').whereIn('nisn', Array.from(nisnDiampu.keys()));
            })
                .count('* as total')
                .first();
            const tujuhHariTerakhir = Array.from({ length: 7 }, (_, i) => DateTime.now()
                .minus({ days: 6 - i })
                .toISODate());
            const chartAbsensiData = await Promise.all(tujuhHariTerakhir.map(async (date) => {
                if (!date)
                    return { date: '', total: 0 };
                const absensi = await DataAbsensi.query()
                    .where('hari', date)
                    .whereIn('userId', (query) => {
                    query
                        .from('data_siswas')
                        .select('user_id')
                        .whereIn('nisn', Array.from(nisnDiampu.keys()));
                })
                    .count('* as total');
                return {
                    date: DateTime.fromISO(date).toFormat('dd/MM'),
                    fullDate: date,
                    total: Number(absensi[0]?.$extras.total) || 0,
                };
            }));
            const startOfMonth = DateTime.now().startOf('month');
            const endOfMonth = DateTime.now().endOf('month');
            const absensiBulanIniRaw = await DataAbsensi.query()
                .whereBetween('hari', [startOfMonth.toSQL(), endOfMonth.toSQL()])
                .whereIn('userId', (query) => {
                query.from('data_siswas').select('user_id').whereIn('nisn', Array.from(nisnDiampu.keys()));
            })
                .select('status')
                .count('* as count')
                .groupBy('status');
            const statusColors = {
                Hadir: '#10B981',
                Sakit: '#F59E0B',
                Izin: '#3B82F6',
                Alfa: '#EF4444',
                PKL: '#8B5CF6',
            };
            const absensiPieData = absensiBulanIniRaw.map((item) => ({
                status: item.status,
                count: Number(item.$extras.count) || 0,
                color: statusColors[item.status] || '#6B7280',
            }));
            const kelasData = Array.from(kelasMap.values()).slice(0, 4);
            const kemarin = DateTime.now().minus({ days: 1 }).toISODate();
            const absensiKemarin = await DataAbsensi.query()
                .where('hari', kemarin)
                .whereIn('userId', (query) => {
                query.from('data_siswas').select('user_id').whereIn('nisn', Array.from(nisnDiampu.keys()));
            })
                .count('* as total')
                .first();
            const totalAbsensiHariIni = Number(absensiHariIni?.$extras.total) || 0;
            const totalAbsensiKemarin = Number(absensiKemarin?.$extras.total) || 0;
            const trendAbsensi = totalAbsensiKemarin > 0
                ? (((totalAbsensiHariIni - totalAbsensiKemarin) / totalAbsensiKemarin) * 100).toFixed(1)
                : totalAbsensiHariIni > 0
                    ? '+100'
                    : '0';
            const getTrendColor = (trend) => {
                const trendNum = parseFloat(trend);
                if (trendNum > 0)
                    return 'text-green-600';
                if (trendNum < 0)
                    return 'text-red-600';
                return 'text-gray-600';
            };
            const getTrendIcon = (trend) => {
                const trendNum = parseFloat(trend);
                if (trendNum > 0)
                    return '↗️';
                if (trendNum < 0)
                    return '↘️';
                return '→';
            };
            const stats = {
                totalSiswa: totalSiswaDiampu,
                totalKelas: totalKelasDiampu,
                totalMapel: totalMapelDiampu,
                absensiHariIni: totalAbsensiHariIni,
                trends: {
                    absensi: {
                        value: trendAbsensi,
                        color: getTrendColor(trendAbsensi),
                        icon: getTrendIcon(trendAbsensi),
                        text: 'dari kemarin',
                    },
                },
            };
            return inertia.render('Dashboard/Guru', {
                stats,
                chartData: {
                    absensiTrend: chartAbsensiData,
                    absensiPie: absensiPieData,
                },
                kelasData,
                user: {
                    fullName: user.fullName,
                    nip: user.dataGuru.nip,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('Dashboard guru error:', error);
            return inertia.render('Dashboard/Guru', {
                stats: {
                    totalSiswa: 0,
                    totalKelas: 0,
                    totalMapel: 0,
                    absensiHariIni: 0,
                    trends: {
                        absensi: {
                            value: '0',
                            color: 'text-gray-600',
                            icon: '→',
                            text: 'dari kemarin',
                        },
                    },
                },
                chartData: {
                    absensiTrend: [],
                    absensiPie: [],
                },
                kelasData: [],
                user: {
                    fullName: '',
                    nip: '',
                },
            });
        }
    }
    async Staf({ inertia, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            await user.load('dataStaf');
            if (!user.dataStaf) {
                throw new Error('Data staf tidak ditemukan');
            }
            const departemen = user.dataStaf.departemen;
            let stats = {};
            let chartData = {};
            let additionalData = {};
            switch (departemen) {
                case 'Administrasi':
                    ;
                    [stats, chartData, additionalData] = await this.getAdminData();
                    break;
                case 'Keuangan':
                    ;
                    [stats, chartData, additionalData] = await this.getFinanceData();
                    break;
                case 'Multimedia':
                    ;
                    [stats, chartData, additionalData] = await this.getMultimediaData();
                    break;
                default:
                    ;
                    [stats, chartData, additionalData] = await this.getDefaultStaffData();
            }
            return inertia.render('Dashboard/Staf', {
                stats,
                chartData,
                additionalData,
                user: {
                    fullName: user.fullName,
                    nip: user.dataStaf.nip,
                    departemen: user.dataStaf.departemen,
                    role: user.role,
                },
            });
        }
        catch (error) {
            console.error('Dashboard staf error:', error);
            const user = auth.user;
            const dataStaf = await DataStaf.query()
                .where('user_id', user?.id ?? '')
                .first();
            return inertia.render('Dashboard/Staf', {
                stats: {},
                chartData: {},
                additionalData: {},
                user: {
                    fullName: user?.fullName,
                    role: user?.role,
                    departemen: dataStaf?.departemen,
                },
            });
        }
    }
    async Siswa({ inertia, request, auth }) {
        try {
            await auth.check();
            const user = auth.user;
            const monthParam = request.param('month');
            await user.load('dataSiswa');
            if (!user.dataSiswa) {
                logger.error('Gagal memuat dashboard siswa');
            }
            const [absensiData, ujianData, ujianTersedia, chartAbsensi] = await Promise.all([
                DataAbsensi.query()
                    .where('user_id', user.id)
                    .where('hari', '>=', DateTime.now().minus({ months: 1 }).toSQL()),
                ManajemenKehadiran.query()
                    .where('user_id', user.id)
                    .preload('ujian', (query) => query.select(['id', 'namaUjian', 'jenisUjian'])),
                BankSoal.query().select(['id', 'namaUjian', 'jenisUjian', 'tanggalUjian', 'waktu']),
                this.getAbsensiChartData(user.id, monthParam),
            ]);
            const totalAbsensi = absensiData.length;
            const absensiHadir = absensiData.filter((item) => item.status === 'Hadir').length;
            const absensiIzin = absensiData.filter((item) => item.status === 'Izin').length;
            const absensiSakit = absensiData.filter((item) => item.status === 'Sakit').length;
            const absensiAlpha = absensiData.filter((item) => item.status === 'Alfa').length;
            const persentaseKehadiran = totalAbsensi > 0 ? Math.round((absensiHadir / totalAbsensi) * 100) : 0;
            const totalUjian = ujianData.length;
            const ujianSelesai = ujianData.filter((item) => {
                const status = this.getUjianStatus(item);
                return status === 'Selesai';
            }).length;
            const ujianDalamPengerjaan = ujianData.filter((item) => {
                const status = this.getUjianStatus(item);
                return status === 'Dalam Pengerjaan';
            }).length;
            const ujianAkanDatang = ujianTersedia.filter((ujian) => {
                const tanggalUjian = typeof ujian.tanggalUjian == 'string'
                    ? DateTime.fromISO(ujian.tanggalUjian)
                    : ujian.tanggalUjian;
                return tanggalUjian >= DateTime.now() && tanggalUjian <= DateTime.now().plus({ days: 3 });
            });
            return inertia.render('Dashboard/Siswa', {
                statistik: {
                    absensi: {
                        total: totalAbsensi,
                        hadir: absensiHadir,
                        izin: absensiIzin,
                        sakit: absensiSakit,
                        alpha: absensiAlpha,
                        persentase: persentaseKehadiran,
                    },
                    ujian: {
                        total: totalUjian,
                        selesai: ujianSelesai,
                        dalamPengerjaan: ujianDalamPengerjaan,
                    },
                },
                chartAbsensi,
                ujianAkanDatang: ujianAkanDatang.map((ujian) => ujian.toJSON()),
                user: user.toJSON(),
                currentMonth: chartAbsensi.monthParam,
            });
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal memuat dashboard siswa');
        }
    }
    async getAbsensiChartData(userId, month) {
        const currentMonth = month ? DateTime.fromISO(month) : DateTime.now();
        const startOfMonth = currentMonth.startOf('month');
        const endOfMonth = currentMonth.endOf('month');
        const absensiData = await DataAbsensi.query()
            .where('user_id', userId)
            .whereBetween('hari', [startOfMonth.toSQLDate() ?? '', endOfMonth.toSQLDate() ?? ''])
            .orderBy('hari', 'asc');
        const calendarData = [];
        const startDate = startOfMonth.startOf('week');
        const endDate = endOfMonth.endOf('week');
        let currentDate = startDate;
        while (currentDate <= endDate) {
            const dateString = currentDate.toISODate();
            const absensiHariIni = absensiData.find((absensi) => typeof absensi.hari == 'string'
                ? DateTime.fromSQL(absensi.hari).toISODate() === dateString
                : absensi.hari.toISODate() === dateString);
            const isCurrentMonth = currentDate.hasSame(startOfMonth, 'month');
            const isSunday = currentDate.weekday === 1;
            calendarData.push({
                date: dateString,
                day: currentDate.day,
                isCurrentMonth,
                isSunday,
                status: absensiHariIni
                    ? absensiHariIni.status
                    : isCurrentMonth
                        ? 'Tidak Ada Data'
                        : 'Bulan Lain',
                warna: this.getStatusColor(absensiHariIni ? absensiHariIni.status : isCurrentMonth ? 'Tidak Ada Data' : 'Bulan Lain'),
            });
            currentDate = currentDate.plus({ days: 1 });
        }
        return {
            calendarData,
            month: startOfMonth.toFormat('MMMM yyyy'),
            monthParam: startOfMonth.toFormat('yyyy-MM'),
            prevMonth: startOfMonth.minus({ months: 1 }).toFormat('yyyy-MM'),
            nextMonth: startOfMonth.plus({ months: 1 }).toFormat('yyyy-MM'),
            totalDays: calendarData.filter((day) => day.isCurrentMonth).length,
            daysHadir: calendarData.filter((day) => day.isCurrentMonth && day.status === 'Hadir').length,
        };
    }
    getStatusColor(status) {
        const colors = {
            'Hadir': 'bg-green-500',
            'Izin': 'bg-yellow-500',
            'Sakit': 'bg-blue-500',
            'Alpha': 'bg-red-500',
            'Tidak Ada Data': 'bg-gray-300',
        };
        return colors[status] || 'bg-gray-300';
    }
    getUjianStatus(kehadiran) {
        if (kehadiran.skor && parseFloat(kehadiran.skor) > 0) {
            return 'Selesai';
        }
        else if (parseInt(kehadiran.benar) > 0 || parseInt(kehadiran.salah) > 0) {
            return 'Dalam Pengerjaan';
        }
        else {
            return 'Belum Mulai';
        }
    }
    async getAdminData() {
        const [totalSiswa, totalGuru, totalKelas, totalMapel, totalWali, totalBankSoal, kelasData, siswaBaruBulanIni,] = await Promise.all([
            DataSiswa.query().count('* as total').first(),
            DataGuru.query().count('* as total').first(),
            DataKelas.query().count('* as total').first(),
            DataMapel.query().count('* as total').first(),
            DataWali.query().count('* as total').first(),
            BankSoal.query().count('* as total').first(),
            DataKelas.query().select('namaKelas', 'jenjang').limit(5),
            DataSiswa.query()
                .whereBetween('createdAt', [
                DateTime.now().startOf('month').toSQL(),
                DateTime.now().endOf('month').toSQL(),
            ])
                .count('* as total')
                .first(),
        ]);
        const stats = {
            totalSiswa: Number(totalSiswa?.$extras.total) || 0,
            totalGuru: Number(totalGuru?.$extras.total) || 0,
            totalKelas: Number(totalKelas?.$extras.total) || 0,
            totalMapel: Number(totalMapel?.$extras.total) || 0,
            totalWali: Number(totalWali?.$extras.total) || 0,
            totalBankSoal: Number(totalBankSoal?.$extras.total) || 0,
            siswaBaruBulanIni: Number(siswaBaruBulanIni?.$extras.total) || 0,
        };
        const chartData = {
            userDistribution: [
                { name: 'Siswa', value: stats.totalSiswa, color: '#3B82F6' },
                { name: 'Guru', value: stats.totalGuru, color: '#10B981' },
                { name: 'Wali', value: stats.totalWali, color: '#F59E0B' },
            ],
        };
        const additionalData = {
            kelasData: kelasData.map((kelas) => ({
                namaKelas: kelas.namaKelas,
                jenjang: kelas.jenjang,
            })),
            recentActivities: [],
        };
        return [stats, chartData, additionalData];
    }
    async getFinanceData() {
        const semuaPembayaran = await DataPembayaran.all();
        const pembayaranByJenis = {};
        let totalPendapatanBulanIni = 0;
        let totalTunggakan = 0;
        const startOfMonth = DateTime.now().startOf('month');
        const endOfMonth = DateTime.now().endOf('month');
        semuaPembayaran.forEach((pembayaran) => {
            const jenis = pembayaran.jenisPembayaran;
            const totalDibayar = pembayaran.getTotalDibayar();
            const sisa = pembayaran.getSisaPembayaran();
            if (!pembayaranByJenis[jenis]) {
                pembayaranByJenis[jenis] = { total: 0, count: 0 };
            }
            pembayaranByJenis[jenis].total += totalDibayar;
            pembayaranByJenis[jenis].count += 1;
            if (sisa > 0) {
                totalTunggakan += sisa;
            }
            const pembayaranBulanIni = pembayaran.getNominalBayarArray().filter((item) => {
                const tanggal = DateTime.fromISO(item.tanggal);
                return tanggal >= startOfMonth && tanggal <= endOfMonth;
            });
            totalPendapatanBulanIni += pembayaranBulanIni.reduce((sum, item) => sum + (parseFloat(item.nominal) || 0), 0);
        });
        const stats = {
            totalPendapatan: Object.values(pembayaranByJenis).reduce((sum, item) => sum + item.total, 0),
            totalPendapatanBulanIni,
            totalTunggakan,
            totalTransaksi: semuaPembayaran.length,
            jenisPembayaranCount: Object.keys(pembayaranByJenis).length,
        };
        const chartData = {
            pendapatanByJenis: Object.entries(pembayaranByJenis).map(([jenis, data], index) => ({
                jenis,
                total: data.total,
                count: data.count,
                color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index] || '#6B7280',
            })),
            monthlyTrend: await this.getMonthlyPendapatanTrend(),
        };
        const additionalData = {
            pembayaranTerbaru: semuaPembayaran
                .sort((a, b) => new Date(b.createdAt.toString()).getTime() - new Date(a.createdAt.toString()).getTime())
                .slice(0, 5)
                .map((p) => ({
                id: p.id,
                jenis: p.jenisPembayaran,
                nominal: p.nominalPenetapan,
                status: p.getSisaPembayaran() === 0 ? 'Lunas' : 'Belum Lunas',
            })),
        };
        return [stats, chartData, additionalData];
    }
    async getMultimediaData() {
        const [totalBlog, totalAktivitas, totalAds, blogPublished, aktivitasPublished, adsAktif] = await Promise.all([
            Blog.query().count('* as total').first(),
            DataAktivita.query().count('* as total').first(),
            DataAds.query().count('* as total').first(),
            Blog.query().where('status', 'published').count('* as total').first(),
            DataAktivita.query().where('status', 'published').count('* as total').first(),
            DataAds.query().where('aktif', true).count('* as total').first(),
        ]);
        const blogPopuler = await Blog.query()
            .where('status', 'published')
            .orderBy('dilihat', 'desc')
            .limit(5);
        const stats = {
            totalBlog: Number(totalBlog?.$extras.total) || 0,
            totalAktivitas: Number(totalAktivitas?.$extras.total) || 0,
            totalAds: Number(totalAds?.$extras.total) || 0,
            blogPublished: Number(blogPublished?.$extras.total) || 0,
            aktivitasPublished: Number(aktivitasPublished?.$extras.total) || 0,
            adsAktif: Number(adsAktif?.$extras.total) || 0,
            totalViews: blogPopuler.reduce((sum, blog) => sum + blog.dilihat, 0),
        };
        const chartData = {
            contentDistribution: [
                { name: 'Blog', value: stats.totalBlog, color: '#3B82F6' },
                { name: 'Aktivitas', value: stats.totalAktivitas, color: '#10B981' },
                { name: 'Ads', value: stats.totalAds, color: '#F59E0B' },
            ],
            blogStats: [
                { name: 'Published', value: stats.blogPublished, color: '#10B981' },
                { name: 'Draft', value: stats.totalBlog - stats.blogPublished, color: '#6B7280' },
            ],
        };
        const additionalData = {
            blogPopuler: blogPopuler.map((blog) => ({
                judul: blog.judul,
                dilihat: blog.dilihat,
                penulis: blog.penulisId,
                publishedAt: blog.publishedAt,
            })),
            upcomingAktivitas: await DataAktivita.query()
                .where('tanggalPelaksanaan', '>=', DateTime.now().toSQLDate())
                .where('status', 'published')
                .orderBy('tanggalPelaksanaan', 'asc')
                .limit(3),
        };
        return [stats, chartData, additionalData];
    }
    async getMonthlyPendapatanTrend() {
        const months = Array.from({ length: 6 }, (_, i) => DateTime.now().minus({ months: 5 - i }));
        const monthlyData = await Promise.all(months.map(async (month) => {
            const startOfMonth = month.startOf('month');
            const endOfMonth = month.endOf('month');
            const pembayaranBulanIni = await DataPembayaran.query().whereBetween('createdAt', [
                startOfMonth.toSQL(),
                endOfMonth.toSQL(),
            ]);
            const total = pembayaranBulanIni.reduce((sum, p) => sum + p.getTotalDibayar(), 0);
            return {
                month: month.toFormat('MMM yyyy'),
                total,
                count: pembayaranBulanIni.length,
            };
        }));
        return monthlyData;
    }
    async getDefaultStaffData() {
        return [
            {
                welcomeMessage: 'Selamat datang di dashboard staf',
            },
            {},
            {},
        ];
    }
}
//# sourceMappingURL=dashboard_sas_controller.js.map