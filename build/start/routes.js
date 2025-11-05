import AuthenticationController from '#controllers/authentication_controller';
import router from '@adonisjs/core/services/router';
import { middleware } from './kernel.js';
import DataSiswasController from '#controllers/data_siswas_controller';
import DataGurusController from '#controllers/data_gurus_controller';
import DataStafsController from '#controllers/data_stafs_controller';
import DataKelasController from '#controllers/data_kelas_controller';
import DataJurusansController from '#controllers/data_jurusans_controller';
import DataTahunAjaransController from '#controllers/data_tahun_ajarans_controller';
import DataMapelsController from '#controllers/data_mapels_controller';
import DataWaliKelasController from '#controllers/data_wali_kelas_controller';
import DataAbsensiController from '#controllers/data_absensis_controller';
import DataPembayaranController from '#controllers/data_pembayarans_controller';
import DataInformasiController from '#controllers/data_informasis_controller';
import DashboardSasController from '#controllers/dashboard_sas_controller';
import BankSoalsController from '#controllers/bank_soals_controller';
import DataJawabansController from '#controllers/data_jawabans_controller';
import DataAbsensiWaliKelasController from '#controllers/data_absensi_wali_kelas_controller';
import BlogController from '#controllers/blog_controller';
import FileUploadService from '#services/file_upload_service';
import UjiansController from '#controllers/ujians_controller';
import SiswaAbsensiController from '#controllers/siswa_absensi_controller';
import UserAccountController from '#controllers/user_account_controller';
import DataAktivitasController from '#controllers/data_aktivitas_controller';
import DataAdsController from '#controllers/data_ads_controller';
import LandingPageController from '#controllers/data_website_controller';
import SuperAdminController from '#controllers/data_super_admin';
import WhatsAppController from '#controllers/whats_apps_controller';
import DataSiswaPraRegistsController from '#controllers/data_siswa_pra_regists_controller';
import ManifestController from '#controllers/manifest_controller';
import DataPasswordsController from '#controllers/data_passwords_controller';
router
    .group(() => {
    router.get('/', [LandingPageController, 'Dashboard']);
    router.on('/textEditor').renderInertia('TextEditor');
    router.get('/profile', [LandingPageController, 'Profile']);
    router.get('/guru-staf', [LandingPageController, 'GuruStaf']);
    router.get('/blog', [LandingPageController, 'Blog']);
    router.get('/blog/:slug', [LandingPageController, 'showBlog']);
    router.get('/kegiatan', [LandingPageController, 'activity']);
    router.get('/kegiatan/:id', [LandingPageController, 'showActivity']);
    router.get('/login', [AuthenticationController, 'index']);
    router.get('/ppdb', [DataSiswasController, 'ppdbForm']);
})
    .middleware([middleware.webData()]);
router.get('/manifest.json', [ManifestController, 'show']);
router.post('/ppdb/register', [DataSiswasController, 'ppdbRegister']);
router.get('/ppdb/success', [DataSiswasController, 'ppdbSuccess']);
router.delete('/logout', [AuthenticationController, 'destroy']);
router.post('/login', [AuthenticationController, 'store']);
router.post('/register', [AuthenticationController, 'register']);
router
    .group(() => {
    router.post('/initialize', [WhatsAppController, 'initialize']);
    router.get('/status', [WhatsAppController, 'getStatus']);
    router.get('/qr', [WhatsAppController, 'getQRCode']);
    router.post('/send-message', [WhatsAppController, 'sendMessage']);
    router.post('/bulk-send', [WhatsAppController, 'bulkSendMessage']);
    router.post('/bulk-check', [WhatsAppController, 'bulkCheckNumbers']);
    router.post('/destroy', [WhatsAppController, 'destroy']);
})
    .prefix('/api/whatsapp')
    .use([middleware.auth()]);
router.post('/switch/:role', async ({ params, session, response }) => {
    const role = params.role;
    const allowedRoles = ['Guru', 'Staf'];
    if (!allowedRoles.includes(role)) {
        session.flash({
            status: 'error',
            message: `Role Tidak Valid`,
        });
        return response.redirect().back();
    }
    session.put('role', role);
    session.flash({
        status: 'success',
        message: `Berhasil beralih ke role ${role}`,
    });
    switch (role) {
        case 'Guru':
            return response.redirect('/guru');
        case 'Staf':
            return response.redirect('/staf');
        default:
            return response.redirect().back();
    }
});
router
    .group(() => {
    router.get('/', [DashboardSasController, 'SuperAdmin']).as('superadmin.index');
    router
        .resource('/manajemen-siswa', DataSiswasController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.siswa');
    router
        .get('/manajemen-siswa/kelas', [DataSiswasController, 'indexPerKelas'])
        .as('superadmin.siswa.kelas');
    router
        .get('/manajemen-siswa/praregist', [DataSiswaPraRegistsController, 'index'])
        .as('superadmin.siswa.praregist');
    router
        .post('/manajemen-siswa/praregist/:nisn/status', [
        DataSiswaPraRegistsController,
        'updateStatus',
    ])
        .as('superadmin.siswa.praregist.status');
    router
        .post('/manajemen-siswa/praregist/:nisn/daftarulang', [
        DataSiswaPraRegistsController,
        'updateToDaftarUlang',
    ])
        .as('superadmin.siswa.praregist.daftarulang');
    router
        .get('/manajemen-siswa/export', [DataSiswasController, 'exportExcel'])
        .as('superadmin.siswa.export');
    router
        .post('/manajemen-siswa/import', [DataSiswasController, 'importExcel'])
        .as('superadmin.siswa.import');
    router
        .resource('/manajemen-guru', DataGurusController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.guru');
    router
        .get('/manajemen-guru/:id/cekGuru/', [DataGurusController, 'cekUser'])
        .as('superadmin.guru.cekguru');
    router
        .get('/manajemen-guru/export', [DataGurusController, 'exportExcel'])
        .as('superadmin.guru.export');
    router
        .post('/manajemen-guru/import', [DataGurusController, 'importExcel'])
        .as('superadmin.guru.import');
    router
        .resource('/manajemen-staf', DataStafsController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.staf');
    router
        .get('/manajemen-staf/:id/cekStaf/', [DataStafsController, 'cekUser'])
        .as('superadmin.staf.cekguru');
    router
        .get('/manajemen-staf/export', [DataStafsController, 'exportExcel'])
        .as('superadmin.staf.export');
    router
        .post('/manajemen-staf/import', [DataStafsController, 'importExcel'])
        .as('superadmin.staf.import');
    router
        .resource('/manajemen-kelas', DataKelasController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.kelas');
    router
        .resource('/manajemen-jurusan', DataJurusansController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.jurusan');
    router
        .resource('/manajemen-tahun-ajaran', DataTahunAjaransController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.tahun_ajaran');
    router
        .resource('/manajemen-mapel', DataMapelsController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.mapel');
    router
        .resource('/manajemen-wali-kelas', DataWaliKelasController)
        .only(['index'])
        .as('superadmin.wali_kelas');
    router.group(() => {
        router
            .resource('/laporan-absensi', DataAbsensiController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('superadmin.absensi');
        router
            .get('/laporan-absensi/siswa/:kelasId', [DataAbsensiController, 'getSiswaByKelas'])
            .as('superadmin.absensi.get_siswa');
        router
            .get('/laporan-absensi/:userId/siswa', [DataAbsensiController, 'view'])
            .as('superadmin.absensi.view');
        router
            .post('/laporan-absensi/bulk', [DataAbsensiController, 'storeBulk'])
            .as('superadmin.absensi.bulk');
    });
    router.group(() => {
        router
            .resource('/laporan-pembayaran', DataPembayaranController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('superadmin.pembayaran');
        router
            .post('/laporan-pembayaran/:id/tambah-pembayaran', [
            DataPembayaranController,
            'tambahPembayaran',
        ])
            .as('superadmin.pembayaran.tambah');
        router
            .get('/laporan-pembayaran/check-existing', [DataPembayaranController, 'checkExisting'])
            .as('superadmin.pembayaran.check');
        router
            .get('/laporan-pembayaran/:id/cetak-invoice', [DataPembayaranController, 'cetakInvoice'])
            .as('superadmin.pembayaran.cetak_invoice');
        router
            .get('/laporan-pembayaran/:id/cetak', ({ inertia, params }) => {
            return inertia.render('Pembayaran/CetakInvoice', {
                pembayaranId: params.id,
            });
        })
            .as('superadmin.pembayaran.cetak');
    });
    router.get('/partisipasi-ujian', [DataPembayaranController, 'partisipasiUjian']);
    router.post('/partisipasi-ujian/update-partisipasi-ujian', [
        DataPembayaranController,
        'updatePartisipasiUjian',
    ]);
    router.post('/partisipasi-ujian/bulk-update-partisipasi-ujian', [
        DataPembayaranController,
        'bulkUpdatePartisipasiUjian',
    ]);
    router
        .resource('/manajemen-informasi', DataInformasiController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.informasi');
    router
        .resource('/manajemen-aktivitas', DataAktivitasController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.aktivitas');
    router
        .resource('/manajemen-ads', DataAdsController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('superadmin.ads');
    router.group(() => {
        router
            .resource('/bank-soal', BankSoalsController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('superadmin.bankSoal');
        router
            .get('/bank-soal/:id/file', [BankSoalsController, 'getFileContent'])
            .as('superadmin.bankSoal.getFile');
        router
            .get('bank-soal/:id/edit-soal', [BankSoalsController, 'editSoal'])
            .as('superadmin.bankSoal.editSoal');
        router
            .get('bank-soal/:id/selected-soal', [BankSoalsController, 'selectedSoal'])
            .as('superadmin.bankSoal.selectedSoal');
        router
            .put('bank-soal/:id/update-soal', [BankSoalsController, 'updateSoal'])
            .as('superadmin.bankSoal.updateSoal');
    });
    router
        .resource('bank-soal/data-password', DataPasswordsController)
        .only(['index', 'store', 'update', 'destroy'])
        .as('superadmin.dataPassword');
    router.group(() => {
        router
            .get('/manajemen-kehadiran', [DataJawabansController, 'index'])
            .as('superadmin.kehadiran');
        router
            .get('/manajemen-kehadiran/ujian', [DataJawabansController, 'ujian'])
            .as('superadmin.kehadiran.ujian');
        router
            .post('/manajemen-kehadiran/start-ujian', [DataJawabansController, 'startUjian'])
            .as('superadmin.kehadiran.start_ujian');
        router
            .post('/manajemen-kehadiran/:id/submit-jawaban', [DataJawabansController, 'submitJawaban'])
            .as('superadmin.kehadiran.submit_jawaban');
        router
            .get('/manajemen-kehadiran/:id/file', [DataJawabansController, 'getFileContent'])
            .as('superadmin.kehadiran.fileJawaban');
    });
    router.group(() => {
        router.get('/data-super-admin', [SuperAdminController, 'index']);
        router.post('/data-super-admin/store', [SuperAdminController, 'store']);
        router.delete('/data-super-admin/:id', [SuperAdminController, 'destroy']);
    });
    router.get('/landing-page', [LandingPageController, 'index']);
    router.post('/landing-page/settings', [LandingPageController, 'update']);
    router.post('/landing-page/upload-fasilitas', [LandingPageController, 'uploadFasilitas']);
    router.get('/laporan-nilai', [DataJawabansController, 'index']).as('superadmin.nilai');
    router
        .get('/laporan-nilai/cetak', [DataJawabansController, 'export'])
        .as('superadmin.nilai.cetak');
    router.on('/whatsapp').renderInertia('Whatsapp/Whatsapp');
    router.get('/account', [UserAccountController, 'index']).as('superadmin.account.index');
    router.get('/account/edit', [UserAccountController, 'edit']).as('superadmin.account.edit');
    router.put('/account/update', [UserAccountController, 'update']).as('superadmin.account.update');
})
    .prefix('SuperAdmin')
    .use([middleware.auth(), middleware.roleManajemen(['SuperAdmin']), middleware.webData()]);
router
    .group(() => {
    router.get('/', [DashboardSasController, 'Guru']).as('guru.index');
    router.get('/manajemen-siswa', [DataSiswasController, 'indexGuru']).as('guru.siswa');
    router.group(() => {
        router
            .resource('/bank-soal', BankSoalsController)
            .only(['store', 'update', 'destroy'])
            .as('guru.bankSoal');
        router.get('/bank-soal/', [BankSoalsController, 'indexGuru']).as('guru.bankSoal.index');
        router
            .get('/bank-soal/create', [BankSoalsController, 'createGuru'])
            .as('guru.bankSoal.create');
        router.get('/bank-soal/:id/edit', [BankSoalsController, 'editGuru']).as('guru.bankSoal.edit');
        router
            .get('/bank-soal/:id/file', [BankSoalsController, 'getFileContent'])
            .as('guru.bankSoal.getFile');
        router
            .get('bank-soal/:id/edit-soal', [BankSoalsController, 'editSoal'])
            .as('guru.bankSoal.editSoal');
        router
            .put('bank-soal/:id/update-soal', [BankSoalsController, 'updateSoal'])
            .as('guru.bankSoal.updateSoal');
    });
    router.group(() => {
        router.get('/manajemen-kehadiran', [DataJawabansController, 'index']).as('guru.kehadiran');
        router
            .get('/manajemen-kehadiran/:id/file', [DataJawabansController, 'getFileContent'])
            .as('guru.kehadiran.fileJawaban');
        router.get('/laporan-nilai', [DataJawabansController, 'index']).as('guru.nilai');
        router.get('/laporan-nilai/cetak', [DataJawabansController, 'export']).as('guru.nilai.cetak');
    });
    router.group(() => {
        router
            .resource('/laporan-absensi', DataAbsensiController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('guru.absensi');
        router
            .get('/laporan-absensi/siswa/:kelasId', [DataAbsensiController, 'getSiswaByKelas'])
            .as('guru.absensi.get_siswa');
        router
            .get('/laporan-absensi/:userId/siswa', [DataAbsensiController, 'view'])
            .as('guru.absensi.view');
        router
            .post('/laporan-absensi/bulk', [DataAbsensiController, 'storeBulk'])
            .as('guru.absensi.bulk');
    });
    router
        .resource('/manajemen-informasi', DataInformasiController)
        .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
        .as('guru.informasi');
    router
        .resource('/laporan-pembayaran', DataPembayaranController)
        .only(['index'])
        .as('guru.pembayaran');
    router.group(() => {
        router
            .resource('/wali-kelas-absensi', DataAbsensiWaliKelasController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('guru.absensiWaliKelas');
        router
            .get('/wali-kelas-absensi/siswa/:kelasId', [
            DataAbsensiWaliKelasController,
            'getSiswaByKelas',
        ])
            .as('guru.absensiWaliKelas.siswaById');
        router
            .post('/wali-kelas-absensi/bulk', [DataAbsensiWaliKelasController, 'storeBulk'])
            .as('guru.absensiWaliKelas.storeBulk');
        router
            .get('/wali-kelas-absensi/offline-stats', [
            DataAbsensiWaliKelasController,
            'getOfflineStats',
        ])
            .as('guru.absensiWaliKelas.offlineStats');
        router.get('/account', [UserAccountController, 'index']).as('guru.account.index');
        router.get('/account/edit', [UserAccountController, 'edit']).as('guru.account.edit');
        router.put('/account/update', [UserAccountController, 'update']).as('guru.account.update');
    });
})
    .prefix('guru')
    .use([middleware.auth(), middleware.roleManajemen(['Guru']), middleware.webData()]);
router
    .group(() => {
    router.group(() => {
        router.get('/', [DashboardSasController, 'Staf']).as('staf.index');
        router
            .resource('/manajemen-siswa', DataSiswasController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.siswa');
        router
            .get('/manajemen-siswa/praregist', [DataSiswaPraRegistsController, 'index'])
            .as('staf.siswa.praregist');
        router
            .get('/manajemen-siswa/praregist/:nisn/status', [
            DataSiswaPraRegistsController,
            'updateStatus',
        ])
            .as('staf.siswa.praregist.status');
        router
            .get('/manajemen-siswa/praregist/:nisn/daftarulang', [
            DataSiswaPraRegistsController,
            'updateToDaftarUlang',
        ])
            .as('staf.siswa.praregist.daftarulang');
        router
            .get('/manajemen-siswa/kelas', [DataSiswasController, 'indexPerKelas'])
            .as('staf.siswa.kelas');
        router.get('/manajemen-siswa/export', [DataSiswasController, 'exportExcel']).as('staf.export');
        router
            .post('/manajemen-siswa/import', [DataSiswasController, 'importExcel'])
            .as('staf.import');
        router
            .resource('/manajemen-guru', DataGurusController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.guru');
        router
            .resource('/manajemen-wali-kelas', DataWaliKelasController)
            .only(['index'])
            .as('staf.wali_kelas');
        router
            .resource('/manajemen-kelas', DataKelasController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.kelas');
        router
            .resource('/manajemen-jurusan', DataJurusansController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.jurusan');
        router
            .resource('/manajemen-tahun-ajaran', DataTahunAjaransController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.tahun_ajaran');
        router
            .resource('/manajemen-mapel', DataMapelsController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.mapel');
        router
            .resource('/aktivitas', DataAktivitasController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.aktivitas');
        router
            .resource('/ads', DataAdsController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.ads');
        router.get('/partisipasi-ujian', [DataPembayaranController, 'partisipasiUjian']);
        router.post('/partisipasi-ujian/update-partisipasi-ujian', [
            DataPembayaranController,
            'updatePartisipasiUjian',
        ]);
        router.post('/partisipasi-ujian/bulk-update-partisipasi-ujian', [
            DataPembayaranController,
            'bulkUpdatePartisipasiUjian',
        ]);
        router.group(() => {
            router
                .resource('/bank-soal', BankSoalsController)
                .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
                .as('staf.bankSoal');
            router
                .get('/bank-soal/:id/file', [BankSoalsController, 'getFileContent'])
                .as('staf.bankSoal.getFile');
            router
                .get('bank-soal/:id/edit-soal', [BankSoalsController, 'editSoal'])
                .as('staf.bankSoal.editSoal');
            router
                .get('bank-soal/:id/selected-soal', [BankSoalsController, 'selectedSoal'])
                .as('staf.bankSoal.selectedSoal');
            router
                .put('bank-soal/:id/update-soal', [BankSoalsController, 'updateSoal'])
                .as('staf.bankSoal.updateSoal');
        });
        router.get('/laporan-nilai', [DataJawabansController, 'index']).as('staf.nilai');
    });
    router.group(() => {
        router.group(() => {
            router
                .resource('/laporan-pembayaran', DataPembayaranController)
                .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
                .as('staf.pembayaran');
            router
                .post('/laporan-pembayaran/:id/tambah-pembayaran', [
                DataPembayaranController,
                'tambahPembayaran',
            ])
                .as('staf.pembayaran.tambah');
            router
                .get('/laporan-pembayaran/check-existing', [DataPembayaranController, 'checkExisting'])
                .as('staf.pembayaran.check');
            router
                .get('/laporan-pembayaran/:id/cetak-invoice', [DataPembayaranController, 'cetakInvoice'])
                .as('staf.pembayaran.cetak_invoice');
            router
                .get('/laporan-pembayaran/:id/cetak', ({ inertia, params }) => {
                return inertia.render('Pembayaran/CetakInvoice', {
                    pembayaranId: params.id,
                });
            })
                .as('staf.pembayaran.cetak');
        });
    });
    router.group(() => {
        router
            .resource('/manajemen-informasi', DataInformasiController)
            .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
            .as('staf.informasi');
        router.group(() => {
            router
                .resource('/blogs', BlogController)
                .only(['index', 'create', 'store', 'edit', 'update', 'destroy'])
                .as('staf.blog');
        });
        router.get('/uploads/blogs/:fileName', async ({ params, response }) => {
            try {
                const fileService = new FileUploadService();
                const fileBuffer = await fileService.getDecryptedFile(params.fileName, 'blogs');
                const isPng = fileBuffer.slice(0, 8).toString('hex') === '89504e470d0a1a0a';
                const isJpeg = fileBuffer.slice(0, 2).toString('hex') === 'ffd8';
                const isWebp = fileBuffer.slice(0, 4).toString() === 'RIFF';
                let contentType = 'image/jpeg';
                if (isPng)
                    contentType = 'image/png';
                if (isJpeg)
                    contentType = 'image/jpeg';
                if (isWebp)
                    contentType = 'image/webp';
                response.header('Content-Type', contentType);
                response.header('Cache-Control', 'public, max-age=31536000');
                return response.send(fileBuffer);
            }
            catch (error) {
                return response.notFound('File not found');
            }
        });
    });
    router.get('/account', [UserAccountController, 'index']).as('staf.account.index');
    router.get('/account/edit', [UserAccountController, 'edit']).as('staf.account.edit');
    router.put('/account/update', [UserAccountController, 'update']).as('staf.account.update');
})
    .prefix('staf')
    .use([middleware.auth(), middleware.roleManajemen(['Staf']), middleware.webData()]);
router
    .group(() => {
    router.get('/jadwalujian', [UjiansController, 'jadwalUjian']);
    router.get('/ujian/:id', [UjiansController, 'mulaiUjian']);
    router.post('/ujian/:id/saveJawaban', [UjiansController, 'saveJawaban']);
    router.post('/ujian/:id/submitJawaban', [UjiansController, 'submitJawaban']);
    router.get('/riwayatujian', [DataJawabansController, 'indexSiswa']);
    router.get('/preview/:id', [DataJawabansController, 'previewJawaban']);
    router.get('/absensi', [SiswaAbsensiController, 'index']);
    router.get('/absensi/mapel/:mapelId', [SiswaAbsensiController, 'detailMapel']);
    router.get('/tagihan', [DataPembayaranController, 'indexSiswa']);
    router.get('/acc', [DataPembayaranController, 'indexSiswa']);
    router.get('/account', [UserAccountController, 'index']).as('siswa.account.index');
    router.get('/account/edit', [UserAccountController, 'edit']).as('siswa.account.edit');
    router.put('/account/update', [UserAccountController, 'update']).as('siswa.account.update');
    router.get('/:month?', [DashboardSasController, 'Siswa']);
})
    .prefix('siswa')
    .use([middleware.auth(), middleware.roleManajemen(['Siswa']), middleware.webData()]);
//# sourceMappingURL=routes.js.map