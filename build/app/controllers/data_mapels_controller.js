import DataGuru from '#models/data_guru';
import DataMapel from '#models/data_mapel';
import { mapelValidator } from '#validators/data_mapel';
import logger from '@adonisjs/core/services/logger';
import db from '@adonisjs/lucid/services/db';
export default class DataMapelsController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const [totalMapel] = await Promise.all([DataMapel.query().count('* as total').first()]);
        const query = DataMapel.query();
        if (search) {
            query.where((builder) => {
                builder
                    .where('nama_mata_pelajaran', 'LIKE', `%${search}%`)
                    .orWhere('jenjang', 'LIKE', `%${search}%`);
            });
        }
        const mapelPaginate = await query
            .orderBy('jenjang', 'asc')
            .paginate(page, search ? Number(totalMapel?.$extras.total) || 1 : 15);
        const mapels = mapelPaginate.all().map((item) => item.toJSON());
        const newMapelData = await Promise.all(mapels.map(async (item) => {
            const nips = Array.isArray(item.guruAmpu)
                ? item.guruAmpu
                : JSON.parse(item.guruAmpu || '[]');
            const guruData = nips.length
                ? await DataGuru.query()
                    .preload('user', (user) => user.select(['fullName']))
                    .select(['nip', 'userId', 'gelarDepan', 'gelarBelakang'])
                    .whereIn('nip', nips)
                : [];
            return { ...item, guruData };
        }));
        const data = await Promise.all(newMapelData.map((dMapel) => ({
            ...dMapel,
            dataGuru: dMapel?.guruData?.map((dGuru) => ({
                nip: dGuru.nip,
                userId: dGuru.userId,
                fullName: dGuru?.user?.fullName,
                gelarDepan: dGuru.gelarDepan,
                gelarBelakang: dGuru.gelarBelakang,
            })),
            guruAmpuNames: dMapel?.guruData?.map((dGuru) => dGuru?.user?.fullName).join(', '),
        })));
        return inertia.render('Mapel/Index', {
            mapelPaginate: {
                currentPage: mapelPaginate.currentPage,
                lastPage: mapelPaginate.lastPage,
                total: mapelPaginate.total,
                perPage: mapelPaginate.perPage,
                firstPage: 1,
                nextPage: mapelPaginate.currentPage < mapelPaginate.lastPage ? mapelPaginate.currentPage + 1 : null,
                previousPage: mapelPaginate.currentPage > 1 ? mapelPaginate.currentPage - 1 : null,
            },
            mapels: data,
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async create({ inertia, session }) {
        const dataGuru = await DataGuru.query()
            .select(['nip', 'userId'])
            .preload('user', (user) => user.select(['fullName']));
        return inertia.render('Mapel/Create', { dataGuru, session: session.flashMessages.all() });
    }
    async store({ request, response, session }) {
        const trx = await db.transaction();
        try {
            const payload = await request.validateUsing(mapelValidator);
            const newPayload = {
                ...payload,
                guruAmpu: JSON.stringify(payload.guruAmpu),
            };
            await DataMapel.create(newPayload, { client: trx });
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data mata pelajaran berhasil ditambahkan.',
            });
            return response.redirect().toPath('/SuperAdmin/manajemen-mapel');
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, 'Gagal menyimpan data mata pelajaran baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan data mata pelajaran',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const mapel = await DataMapel.findOrFail(params.id);
        const dataGuru = await DataGuru.query()
            .select(['nip', 'userId'])
            .preload('user', (user) => user.select(['fullName']));
        const mapelData = mapel.toJSON();
        mapelData.guruAmpu = mapel.getGuruAmpuArray();
        return inertia.render('Mapel/Edit', {
            mapel: mapelData,
            dataGuru,
            session: session.flashMessages.all(),
        });
    }
    async update({ request, response, session, params }) {
        const trx = await db.transaction();
        const id = params.id;
        try {
            const payload = await request.validateUsing(mapelValidator);
            const mapel = await DataMapel.findOrFail(id);
            mapel.useTransaction(trx);
            const updateData = {
                ...payload,
                guruAmpu: JSON.stringify(payload.guruAmpu),
            };
            mapel.merge(updateData);
            await mapel.save();
            await trx.commit();
            session.flash({
                status: 'success',
                message: 'Data mata pelajaran berhasil diperbarui.',
            });
            return response.redirect().toPath('/SuperAdmin/manajemen-mapel');
        }
        catch (error) {
            await trx.rollback();
            logger.error({ err: error }, `Gagal update data mata pelajaran ID: ${id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui data mata pelajaran',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ response, session, params }) {
        try {
            const { id } = params;
            const mapel = await DataMapel.findOrFail(id);
            await mapel.delete();
            session.flash({
                status: 'success',
                message: 'Data mata pelajaran berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data mata pelajaran`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus data mata pelajaran',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
}
//# sourceMappingURL=data_mapels_controller.js.map