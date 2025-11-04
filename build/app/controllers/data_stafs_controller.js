import DataStaf from '#models/data_staf';
import User from '#models/user';
import { userStafValidator } from '#validators/data_staf';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
import fs from 'fs/promises';
import ExcelJS from 'exceljs';
import { join } from 'path';
import app from '@adonisjs/core/services/app';
export default class DataStafsController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const [totalStaf] = await Promise.all([DataStaf.query().count('* as total').first()]);
        const query = DataStaf.query().preload('user', (user) => user.orderBy('fullName', 'asc'));
        if (search) {
            query.where((builder) => {
                builder
                    .where('nip', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
                    .orWhere('departemen', 'LIKE', `%${search}%`)
                    .orWhere('jabatan', 'LIKE', `%${search}%`);
            });
        }
        const stafPaginate = await query.paginate(page, search ? Number(totalStaf?.$extras.total) || 1 : 15);
        const sortedGuru = stafPaginate.all().sort((a, b) => {
            const nameA = a.user?.fullName?.toLowerCase() || '';
            const nameB = b.user?.fullName?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
        });
        const startNumber = (page - 1) * 15 + 1;
        logger.info('Jumlah Staf: ', Number(totalStaf?.$extras.total));
        return inertia.render('Staf/Index', {
            stafPaginate: {
                currentPage: stafPaginate.currentPage,
                lastPage: stafPaginate.lastPage,
                total: stafPaginate.total,
                perPage: stafPaginate.perPage,
                firstPage: 1,
                nextPage: stafPaginate.currentPage < stafPaginate.lastPage ? stafPaginate.currentPage + 1 : null,
                previousPage: stafPaginate.currentPage > 1 ? stafPaginate.currentPage - 1 : null,
            },
            stafs: sortedGuru.map((item, index) => ({ ...item.toJSON(), nomor: startNumber + index })),
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async create({ inertia, session }) {
        return inertia.render('Staf/Create', { session: session.flashMessages.all() });
    }
    async cekUser({ params, response }) {
        const trx = await db.transaction();
        const email = params.id;
        let user = await User.query({ client: trx })
            .preload('dataGuru')
            .preload('dataStaf')
            .where('email', email)
            .first();
        let dataStaf = user?.dataStaf;
        if (dataStaf) {
            response.json({
                status: 'notReady',
                message: 'Tidak Bisa Membuat Lebih 1 Data Dengan Guru Yang Sama',
            });
        }
        else if (user) {
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
            const payload = await request.validateUsing(userStafValidator);
            const fileFoto = request.file('staf.fileFoto')
                ? await this.uploadFile(request.file('staf.fileFoto'), String(payload.staf.nip))
                : null;
            let user = await User.query({ client: trx }).where('email', payload.user.email).first();
            if (!user) {
                user = await User.create({ ...payload.user, role: 'Staf' }, { client: trx });
            }
            await DataStaf.create({ ...payload.staf, userId: user.id, fileFoto: fileFoto }, { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data staf berhasil ditambahkan.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data staf baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan data staf',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const staf = await DataStaf.query().where('nip', params.id).preload('user').firstOrFail();
        return inertia.render('Staf/Edit', { staf, session: session.flashMessages.all() });
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        const id = params.id;
        logger.info(id);
        try {
            const payload = await request.validateUsing(userStafValidator);
            const staf = await DataStaf.query().where('nip', id).firstOrFail();
            const user = await User.findOrFail(staf?.userId, { client: trx });
            const fileFoto = request.file('staf.fileFoto')
                ? await this.uploadFile(request.file('staf.fileFoto'), staf.nip)
                : staf.fileFoto;
            const { password } = payload.user;
            user.merge({ ...payload.user, role: 'Staf' });
            if (password) {
                user.password = password;
            }
            await user.save();
            staf?.useTransaction(trx);
            staf?.merge({ ...payload.staf, fileFoto: fileFoto });
            await staf?.save();
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data staf berhasil diperbarui.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update data staf NIP: ${id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui data staf',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const staf = await DataStaf.findOrFail(id);
            const user = await User.query()
                .where('id', staf.userId)
                .preload('dataGuru')
                .preload('dataStaf')
                .firstOrFail();
            await this.deleteFile(staf.fileFoto);
            await staf.delete();
            if (!user.dataGuru) {
                await user.delete();
            }
            session.flash({
                status: 'success',
                message: 'Data staf berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data staf`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus data staf',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async exportExcel({ response }) {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Data Staf');
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
            { header: 'Departemen', key: 'departemen', width: 25 },
            { header: 'Jabatan', key: 'jabatan', width: 20 },
        ];
        const stafs = await DataStaf.query().preload('user');
        stafs.forEach((staf) => {
            sheet.addRow({
                nip: staf.nip,
                namaLengkap: staf.user.fullName,
                email: staf.user.email,
                noHp: staf.noTelepon,
                jenisKelamin: staf.jenisKelamin,
                tempatLahir: staf.tempatLahir,
                tanggalLahir: String(staf.tanggalLahir).split(' ')[0],
                alamat: staf.alamat,
                agama: staf.agama,
                gelarDepan: staf.gelarDepan,
                gelarBelakang: staf.gelarBelakang,
                departemen: staf.departemen,
                jabatan: staf.jabatan,
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
        response.header('Content-Disposition', 'attachment; filename="data_staf.xlsx"');
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
            const [nip, namaLengkap, email, noHp, jenisKelamin, tempatLahir, tanggalLahir, alamat, agama, gelarDepan, gelarBelakang, departemen, jabatan,] = row.values?.slice(1) || [];
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
                await DataStaf.create({
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
                    departemen: String(departemen ?? ''),
                    jabatan: String(jabatan ?? ''),
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
        const uploadPath = `storage/staf/`;
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
//# sourceMappingURL=data_stafs_controller.js.map