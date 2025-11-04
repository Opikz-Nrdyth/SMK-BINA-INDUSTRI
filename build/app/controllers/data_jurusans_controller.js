import BankSoal from '#models/bank_soal';
import DataJurusan from '#models/data_jurusan';
import DataKelas from '#models/data_kelas';
import { jurusanValidator } from '#validators/data_jurusan';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
export default class DataJurusansController {
    async index({ request, inertia, session, auth }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        await auth.check();
        const [totalJurusan] = await Promise.all([DataJurusan.query().count('* as total').first()]);
        const query = DataJurusan.query();
        if (search) {
            query.where((builder) => {
                builder
                    .where('kode_jurusan', 'LIKE', `%${search}%`)
                    .orWhere('nama_jurusan', 'LIKE', `%${search}%`)
                    .orWhere('akreditasi', 'LIKE', `%${search}%`);
            });
        }
        const jurusanPaginate = await query
            .orderBy('created_at', 'desc')
            .paginate(page, search ? Number(totalJurusan?.$extras.total) || 1 : 15);
        const jurusan = jurusanPaginate.all().map((item) => item.toJSON());
        logger.info('Jumlah Jurusan: ', Number(totalJurusan?.$extras.total));
        return inertia.render('Jurusan/Index', {
            jurusanPaginate: {
                currentPage: jurusanPaginate.currentPage,
                lastPage: jurusanPaginate.lastPage,
                total: jurusanPaginate.total,
                perPage: jurusanPaginate.perPage,
                firstPage: 1,
                nextPage: jurusanPaginate.currentPage < jurusanPaginate.lastPage
                    ? jurusanPaginate.currentPage + 1
                    : null,
                previousPage: jurusanPaginate.currentPage > 1 ? jurusanPaginate.currentPage - 1 : null,
            },
            jurusan: jurusan,
            session: session.flashMessages.all(),
            searchQuery: search,
            auth: auth.user,
        });
    }
    async create({ inertia, session }) {
        const dataKelas = await DataKelas.query();
        return inertia.render('Jurusan/Create', { dataKelas, session: session.flashMessages.all() });
    }
    async store({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(jurusanValidator);
            await DataJurusan.create(payload, { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data jurusan berhasil ditambahkan.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data jurusan baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan data jurusan',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const jurusan = await DataJurusan.query().where('id', params.id).firstOrFail();
        const dataKelas = await DataKelas.query();
        return inertia.render('Jurusan/Edit', {
            jurusan,
            dataKelas,
            session: session.flashMessages.all(),
        });
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        const id = params.id;
        try {
            const payload = await request.validateUsing(jurusanValidator);
            const jurusan = await DataJurusan.query().where('id', id).firstOrFail();
            jurusan?.useTransaction(trx);
            jurusan?.merge(payload);
            await jurusan?.save();
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data jurusan berhasil diperbarui.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update data jurusan ID: ${id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui data jurusan',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const jurusan = await DataJurusan.findOrFail(id);
            const dataBankSoal = await BankSoal.query();
            for (const bankSoal of dataBankSoal) {
                const jurusans = typeof bankSoal.jurusan === 'string' ? [bankSoal.jurusan] : bankSoal.jurusan;
                if (Array.isArray(jurusans)) {
                    const filtered = jurusans.filter((id) => id !== jurusan.id);
                    if (filtered.length !== jurusans.length) {
                        bankSoal.jurusan = filtered;
                        await bankSoal.save();
                    }
                }
            }
            await jurusan.delete();
            session.flash({
                status: 'success',
                message: 'Data jurusan berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data jurusan`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus data jurusan',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
}
//# sourceMappingURL=data_jurusans_controller.js.map