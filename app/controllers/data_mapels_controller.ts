import DataGuru from '#models/data_guru'
import DataMapel from '#models/data_mapel'
import { mapelValidator } from '#validators/data_mapel'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class DataMapelsController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const [totalMapel] = await Promise.all([DataMapel.query().count('* as total').first()])

    const query = DataMapel.query()

    if (search) {
      query.where((builder) => {
        builder
          .where('nama_mata_pelajaran', 'LIKE', `%${search}%`)
          .orWhere('jenjang', 'LIKE', `%${search}%`)
      })
    }

    const mapelPaginate = await query
      .orderBy('jenjang', 'asc')
      .paginate(page, search ? Number(totalMapel?.$extras.total) || 1 : 15)

    const mapels = mapelPaginate.all().map((item) => item.toJSON())

    // TIDAK MENYENTUH MAPPING DATA - biarkan sama persis seperti sebelumnya
    const newMapelData = await Promise.all(
      mapels.map(async (item: any) => {
        const nips: string[] = Array.isArray(item.guruAmpu)
          ? item.guruAmpu
          : JSON.parse(item.guruAmpu || '[]')
        const guruData = nips.length
          ? await DataGuru.query()
              .preload('user', (user) => user.select(['fullName']))
              .select(['nip', 'userId', 'gelarDepan', 'gelarBelakang'])
              .whereIn('nip', nips)
          : []
        return { ...item, guruData }
      })
    )

    const data = await Promise.all(
      newMapelData.map((dMapel: any) => ({
        ...dMapel,
        dataGuru: dMapel?.guruData?.map((dGuru: any) => ({
          nip: dGuru.nip,
          userId: dGuru.userId,
          fullName: dGuru?.user?.fullName,
          gelarDepan: dGuru.gelarDepan,
          gelarBelakang: dGuru.gelarBelakang,
        })),
        guruAmpuNames: dMapel?.guruData?.map((dGuru: any) => dGuru?.user?.fullName).join(', '),
      }))
    )

    return inertia.render('Mapel/Index', {
      mapelPaginate: {
        currentPage: mapelPaginate.currentPage,
        lastPage: mapelPaginate.lastPage,
        total: mapelPaginate.total,
        perPage: mapelPaginate.perPage,
        firstPage: 1,
        nextPage:
          mapelPaginate.currentPage < mapelPaginate.lastPage ? mapelPaginate.currentPage + 1 : null,
        previousPage: mapelPaginate.currentPage > 1 ? mapelPaginate.currentPage - 1 : null,
      },
      mapels: data,
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async create({ inertia, session }: HttpContext) {
    const dataGuru = await DataGuru.query()
      .select(['nip', 'userId'])
      .preload('user', (user) => user.select(['fullName']))
    return inertia.render('Mapel/Create', { dataGuru, session: session.flashMessages.all() })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(mapelValidator)

      const newPayload = {
        ...payload,
        guruAmpu: JSON.stringify(payload.guruAmpu),
      }

      await DataMapel.create(newPayload, { client: trx })

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data mata pelajaran berhasil ditambahkan.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-mapel')
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data mata pelajaran baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data mata pelajaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async edit({ inertia, params, session }: HttpContext) {
    const mapel = await DataMapel.findOrFail(params.id)
    const dataGuru = await DataGuru.query()
      .select(['nip', 'userId'])
      .preload('user', (user) => user.select(['fullName']))

    // Parse guruAmpu dari JSON string ke array
    const mapelData = mapel.toJSON()
    mapelData.guruAmpu = mapel.getGuruAmpuArray()

    return inertia.render('Mapel/Edit', {
      mapel: mapelData,
      dataGuru,
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(mapelValidator)

      const mapel = await DataMapel.findOrFail(id)
      mapel.useTransaction(trx)

      // Convert array guruAmpu ke JSON string
      const updateData = {
        ...payload,
        guruAmpu: JSON.stringify(payload.guruAmpu),
      }

      mapel.merge(updateData as any)
      await mapel.save()

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data mata pelajaran berhasil diperbarui.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-mapel')
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data mata pelajaran ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data mata pelajaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const mapel = await DataMapel.findOrFail(id)
      await mapel.delete()

      session.flash({
        status: 'success',
        message: 'Data mata pelajaran berhasil dihapus.',
      })
    } catch (error: any) {
      logger.error({ err: error }, `Gagal hapus data mata pelajaran`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data mata pelajaran',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }
}
