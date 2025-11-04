import Aktivitas from '#models/data_aktivitas';
import { aktivitasValidator } from '#validators/data_aktivitas';
import app from '@adonisjs/core/services/app';
import fs from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import logger from '@adonisjs/core/services/logger';
export default class DataAktivitasController {
    async index({ inertia, request, session }) {
        const search = request.input('search', '');
        const status = request.input('status', '');
        const query = Aktivitas.query()
            .if(search, (q) => q.whereILike('nama', `%${search}%`))
            .if(status, (q) => q.where('status', status))
            .orderBy('tanggal_pelaksanaan', 'desc');
        const aktivitas = await query.paginate(1, 15);
        return inertia.render('Aktivitas/Index', {
            aktivitas: aktivitas.serialize().data,
            aktivitasPaginate: aktivitas.serialize().meta,
            searchQuery: search,
            filterStatus: status,
            session: session.flashMessages.all(),
        });
    }
    async create({ inertia, session }) {
        return inertia.render('Aktivitas/Create', { session: session.flashMessages.all() });
    }
    async store({ request, response, session, auth }) {
        try {
            const data = await request.validateUsing(aktivitasValidator);
            const file = request.file('dokumentasi');
            let fileName = null;
            if (file) {
                const filePath = join(app.makePath('storage/aktivitas'));
                await file.move(filePath, { name: `${Date.now()}_${file.clientName}` });
                fileName = file.fileName;
            }
            await Aktivitas.create({
                id: randomUUID(),
                nama: data.nama,
                jenis: data.jenis,
                deskripsi: data.deskripsi,
                lokasi: data.lokasi,
                tanggalPelaksanaan: data.tanggal_pelaksanaan,
                status: data.status,
                dokumentasi: fileName,
                createdBy: auth.user?.id || null,
            });
            session.flash({
                status: 'success',
                message: 'Aktivitas berhasil ditambahkan!',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal menyimpan aktivitas');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan aktivitas',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const aktivitas = await Aktivitas.findOrFail(params.id);
        return inertia.render('Aktivitas/Edit', { aktivitas, session: session.flashMessages.all() });
    }
    async update({ request, response, params, session }) {
        try {
            const aktivitas = await Aktivitas.findOrFail(params.id);
            const data = await request.validateUsing(aktivitasValidator);
            const file = request.file('dokumentasi');
            if (file && file.isValid) {
                const filePath = join(app.makePath('storage/aktivitas'));
                if (aktivitas.dokumentasi) {
                    try {
                        await fs.promises.unlink(join(filePath, aktivitas.dokumentasi));
                    }
                    catch (err) {
                    }
                }
                if (aktivitas.dokumentasi && fs.existsSync(join(filePath, aktivitas.dokumentasi))) {
                    fs.unlinkSync(join(filePath, aktivitas.dokumentasi));
                }
                await file.move(filePath, { name: `${Date.now()}_${file.clientName}` });
                aktivitas.dokumentasi = file.fileName;
            }
            aktivitas.merge({
                nama: data.nama,
                jenis: data.jenis,
                deskripsi: data.deskripsi,
                lokasi: data.lokasi,
                tanggalPelaksanaan: data.tanggal_pelaksanaan,
                status: data.status,
            });
            await aktivitas.save();
            session.flash({
                status: 'success',
                message: 'Aktivitas berhasil diperbarui!',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, `Gagal update aktivitas ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui aktivitas',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ params, response, session }) {
        try {
            const aktivitas = await Aktivitas.findOrFail(params.id);
            const filePath = join(app.makePath('storage/aktivitas'));
            if (aktivitas.dokumentasi && fs.existsSync(join(filePath, aktivitas.dokumentasi))) {
                fs.unlinkSync(join(filePath, aktivitas.dokumentasi));
            }
            await aktivitas.delete();
            session.flash({
                status: 'success',
                message: 'Aktivitas berhasil dihapus!',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus aktivitas ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus aktivitas',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async indexPublic({ response }) {
        const aktivitas = await Aktivitas.query()
            .where('status', 'published')
            .orderBy('tanggal_pelaksanaan', 'desc');
        return response.ok(aktivitas);
    }
    async showPublic({ params, response }) {
        const aktivitas = await Aktivitas.query()
            .where('id', params.id)
            .andWhere('status', 'published')
            .firstOrFail();
        return response.ok(aktivitas);
    }
}
//# sourceMappingURL=data_aktivitas_controller.js.map