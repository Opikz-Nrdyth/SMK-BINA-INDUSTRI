import DataSiswa from '#models/data_siswa';
import DataGuru from '#models/data_guru';
import DataStaf from '#models/data_staf';
import db from '@adonisjs/lucid/services/db';
import logger from '@adonisjs/core/services/logger';
import { userAccountValidator } from '#validators/user_account';
export default class UserAccountController {
    async index({ inertia, auth, session }) {
        await auth.check();
        const user = auth.user;
        let profileData = null;
        switch (user.role) {
            case 'Siswa':
                await user.load('dataSiswa');
                if (user.dataSiswa) {
                    profileData = user.dataSiswa.toJSON();
                }
                break;
            case 'Guru':
                await user.load('dataGuru');
                if (user.dataGuru) {
                    profileData = user.dataGuru.toJSON();
                }
                break;
            case 'Staf':
                await user.load('dataStaf');
                if (user.dataStaf) {
                    profileData = user.dataStaf.toJSON();
                }
                break;
            case 'SuperAdmin':
                profileData = {};
                break;
        }
        return inertia.render('UserAccount/Index', {
            user: user.toJSON(),
            profile: profileData,
            session: session.flashMessages.all(),
        });
    }
    async edit({ inertia, auth, session }) {
        await auth.check();
        const user = auth.user;
        let profileData = null;
        switch (user.role) {
            case 'Siswa':
                await user.load('dataSiswa');
                if (user.dataSiswa) {
                    profileData = user.dataSiswa.toJSON();
                }
                break;
            case 'Guru':
                await user.load('dataGuru');
                if (user.dataGuru) {
                    profileData = user.dataGuru.toJSON();
                }
                break;
            case 'Staf':
                await user.load('dataStaf');
                if (user.dataStaf) {
                    profileData = user.dataStaf.toJSON();
                }
                break;
            case 'SuperAdmin':
                profileData = {};
                break;
        }
        return inertia.render('UserAccount/Edit', {
            user: user.toJSON(),
            profile: profileData,
            session: session.flashMessages.all(),
        });
    }
    async update({ request, response, session, auth }) {
        const trx = await db.transaction();
        try {
            await auth.check();
            const user = auth.user;
            const payload = await request.validateUsing(userAccountValidator);
            user.useTransaction(trx);
            user.fullName = payload.fullName;
            user.email = payload.email;
            if (payload.password) {
                user.password = payload.password;
            }
            await user.save();
            switch (user.role) {
                case 'Siswa':
                    if (user.dataSiswa) {
                        const siswa = await DataSiswa.findOrFail(user.dataSiswa.nisn, { client: trx });
                        siswa.useTransaction(trx);
                        siswa.merge({
                            alamat: payload.alamat,
                            noTelepon: payload.noTelepon,
                            jenisKelamin: payload.jenisKelamin,
                            tempatLahir: payload.tempatLahir,
                            tanggalLahir: payload.tanggalLahir,
                            agama: payload.agama,
                        });
                        await siswa.save();
                    }
                    break;
                case 'Guru':
                    if (user.dataGuru) {
                        const guru = await DataGuru.findOrFail(user.dataGuru.nip, { client: trx });
                        guru.useTransaction(trx);
                        guru.merge({
                            alamat: payload.alamat,
                            noTelepon: payload.noTelepon,
                            gelarDepan: payload.gelarDepan,
                            gelarBelakang: payload.gelarBelakang,
                            jenisKelamin: payload.jenisKelamin,
                            tempatLahir: payload.tempatLahir,
                            tanggalLahir: payload.tanggalLahir,
                            agama: payload.agama,
                        });
                        await guru.save();
                    }
                    break;
                case 'Staf':
                    if (user.dataStaf) {
                        const staf = await DataStaf.findOrFail(user.dataStaf.nip, { client: trx });
                        staf.useTransaction(trx);
                        staf.merge({
                            alamat: payload.alamat,
                            noTelepon: payload.noTelepon,
                            gelarDepan: payload.gelarDepan,
                            gelarBelakang: payload.gelarBelakang,
                            jenisKelamin: payload.jenisKelamin,
                            tempatLahir: payload.tempatLahir,
                            tanggalLahir: payload.tanggalLahir,
                            agama: payload.agama,
                        });
                        await staf.save();
                    }
                    break;
                case 'SuperAdmin':
                    break;
            }
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Profile Berhasil Diperbarui',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal update profile user');
            session.flash({
                status: 'error',
                message: 'Gagal Memperbarui Profile',
                error: error.message,
            });
            return response.redirect().withQs().back();
        }
    }
}
//# sourceMappingURL=user_account_controller.js.map