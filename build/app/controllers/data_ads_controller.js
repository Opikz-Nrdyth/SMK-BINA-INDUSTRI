import Ads from '#models/data_ads';
import app from '@adonisjs/core/services/app';
import { join } from 'path';
import fs from 'fs';
import { adsValidator } from '#validators/data_ads';
import { randomUUID } from 'crypto';
import logger from '@adonisjs/core/services/logger';
import { DateTime } from 'luxon';
import DataAds from '#models/data_ads';
export default class DataAdsController {
    async index({ inertia, request, session }) {
        const search = request.input('search', '');
        const tipe = request.input('tipe', '');
        const query = Ads.query()
            .if(search, (q) => q.whereILike('judul', `%${search}%`))
            .if(tipe, (q) => q.where('tipe', tipe))
            .orderBy('created_at', 'desc');
        const page = request.input('page', 1);
        const perPage = 15;
        const ads = await query.paginate(page, perPage);
        return inertia.render('Ads/Home', {
            ads: ads.serialize().data,
            adsPaginate: ads.serialize().meta,
            searchQuery: search,
            filterTipe: tipe,
            session: session.flashMessages.all(),
        });
    }
    async create({ inertia, session }) {
        return inertia.render('Ads/Create', { session: session.flashMessages.all() });
    }
    async store({ request, response, session, auth }) {
        try {
            const data = await request.validateUsing(adsValidator);
            const file = request.file('gambar');
            const parseDate = (value) => {
                if (value instanceof DateTime && value.isValid)
                    return value;
                if (value instanceof Date)
                    return DateTime.fromJSDate(value);
                if (typeof value === 'string') {
                    const date = new Date(value);
                    if (!isNaN(date.getTime())) {
                        return DateTime.fromJSDate(date);
                    }
                }
                return DateTime.invalid('unparsable');
            };
            const mulai = parseDate(data.tanggal_mulai);
            const selesai = parseDate(data.tanggal_selesai);
            if (!mulai.isValid || !selesai.isValid || mulai > selesai) {
                session.flash({
                    status: 'error',
                    message: 'Tanggal mulai dan selesai tidak valid',
                });
                return response.redirect().withQs().back();
            }
            const overlappingAds = await DataAds.query()
                .where('tipe', data.tipe)
                .where((query) => {
                query
                    .where('tanggal_mulai', '<=', selesai.toISO())
                    .andWhere('tanggal_selesai', '>=', mulai.toISO());
            });
            const limitByType = {
                popup: 1,
                banner: 3,
            };
            const limit = limitByType[data.tipe];
            if (overlappingAds.length >= limit) {
                session.flash({
                    status: 'error',
                    message: `Maksimal hanya ${limit} iklan ${data.tipe} dalam rentang waktu yang sama`,
                });
                return response.redirect().withQs().back();
            }
            let fileName = null;
            if (file && file.isValid) {
                const dest = join(app.makePath('storage/ads'));
                await file.move(dest, { name: `${Date.now()}_${file.clientName}` });
                fileName = file.fileName;
            }
            await Ads.create({
                id: randomUUID(),
                judul: data.judul,
                deskripsi: data.deskripsi ?? null,
                tipe: data.tipe,
                gambar: fileName,
                tautan: data.tautan ?? null,
                aktif: data.aktif ?? false,
                tanggalMulai: data.tanggal_mulai ?? null,
                tanggalSelesai: data.tanggal_selesai ?? null,
                createdBy: auth.user?.id ?? null,
            });
            session.flash({
                status: 'success',
                message: 'Iklan berhasil ditambahkan!',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal menyimpan iklan');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan iklan',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async edit({ inertia, params, session }) {
        const ad = await Ads.findOrFail(params.id);
        return inertia.render('Ads/Edit', { ad, session: session.flashMessages.all() });
    }
    async update({ request, params, response, session }) {
        try {
            const ad = await Ads.findOrFail(params.id);
            const data = await request.validateUsing(adsValidator);
            const file = request.file('gambar');
            if (file && file.isValid) {
                const dest = join(app.makePath('storage/ads'));
                if (ad.gambar) {
                    try {
                        await fs.promises.unlink(join(dest, ad.gambar));
                    }
                    catch (err) {
                    }
                }
                await file.move(dest, { name: `${Date.now()}_${file.clientName}` });
                ad.gambar = file.fileName;
            }
            ad.merge({
                judul: data.judul,
                deskripsi: data.deskripsi ?? null,
                tipe: data.tipe,
                tautan: data.tautan ?? null,
                aktif: data.aktif ?? false,
                tanggalMulai: data.tanggal_mulai ?? null,
                tanggalSelesai: data.tanggal_selesai ?? null,
            });
            await ad.save();
            session.flash({
                status: 'success',
                message: 'Iklan berhasil diperbarui!',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, `Gagal update iklan ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal memperbarui iklan',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ params, response, session }) {
        try {
            const ad = await Ads.findOrFail(params.id);
            const dest = join(app.makePath('storage/ads'));
            if (ad.gambar) {
                try {
                    await fs.promises.unlink(join(dest, ad.gambar));
                }
                catch (err) {
                }
            }
            await ad.delete();
            session.flash({
                status: 'success',
                message: 'Iklan berhasil dihapus!',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus iklan ${params.id}`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus iklan',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
    async publicIndex({ response }) {
        const today = new Date().toISOString().slice(0, 10);
        const ads = await Ads.query()
            .where('aktif', true)
            .andWhere((w) => w.whereNull('tanggalMulai').orWhere('tanggalMulai', '<=', today))
            .andWhere((w) => w.whereNull('tanggalSelesai').orWhere('tanggalSelesai', '>=', today))
            .orderBy('created_at', 'desc');
        return response.ok(ads);
    }
    async showPublic({ params, response }) {
        const today = new Date().toISOString().slice(0, 10);
        const ad = await Ads.query()
            .where('id', params.id)
            .andWhere('aktif', true)
            .andWhere((w) => w.whereNull('tanggalMulai').orWhere('tanggalMulai', '<=', today))
            .andWhere((w) => w.whereNull('tanggalSelesai').orWhere('tanggalSelesai', '>=', today))
            .firstOrFail();
        return response.ok(ad);
    }
}
//# sourceMappingURL=data_ads_controller.js.map