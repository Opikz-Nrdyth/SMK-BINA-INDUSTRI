import DataTahunAjaran from '#models/data_tahun_ajaran'
import User from '#models/user'
import { tahunAjaranValidator } from '#validators/data_tahun_ajaran'
import cache from '@adonisjs/cache/services/main'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class DataTahunAjaransController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const [totalTahunAjaran] = await Promise.all([
      DataTahunAjaran.query().count('* as total').first(),
    ])

    const query = DataTahunAjaran.query().preload('user', (user) => {
      user.select(['id', 'fullName'])
    })

    if (search) {
      query.where((builder) => {
        builder
          .where('kode_ta', 'LIKE', `%${search}%`)
          .orWhere('tahun_ajaran', 'LIKE', `%${search}%`)
          .orWhereHas('user', (userQuery) => {
            userQuery.where('full_name', 'LIKE', `%${search}%`)
          })
      })
    }

    const tahunAjaranPaginate = await query
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalTahunAjaran?.$extras.total) || 1 : 15)

    const tahunAjarans = tahunAjaranPaginate.all().map((item) => item.toJSON())

    // TIDAK MENYENTUH MAPPING DATA - biarkan sama persis seperti sebelumnya
    const data = tahunAjarans.map((item: any) => ({
      ...item,
      kepalaSekolahName: item?.user?.fullName,
      kepalaSekolahData: {
        id: item?.user?.id,
        fullName: item?.user?.fullName,
      },
    }))

    return inertia.render('TahunAjaran/Index', {
      tahunAjaranPaginate: {
        currentPage: tahunAjaranPaginate.currentPage,
        lastPage: tahunAjaranPaginate.lastPage,
        total: tahunAjaranPaginate.total,
        perPage: tahunAjaranPaginate.perPage,
        firstPage: 1,
        nextPage:
          tahunAjaranPaginate.currentPage < tahunAjaranPaginate.lastPage
            ? tahunAjaranPaginate.currentPage + 1
            : null,
        previousPage:
          tahunAjaranPaginate.currentPage > 1 ? tahunAjaranPaginate.currentPage - 1 : null,
      },
      tahunAjarans: data,
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async create({ inertia, session }: HttpContext) {
    const users = await User.query().select(['id', 'fullName']).where('role', 'SuperAdmin')
    return inertia.render('TahunAjaran/Create', { users, session: session.flashMessages.all() })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(tahunAjaranValidator)

      await DataTahunAjaran.create(payload, { client: trx })

      await trx.commit()
      await cache.clear()
      session.flash({
        status: 'success',
        message: 'Data tahun ajaran berhasil ditambahkan.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-tahun-ajaran')
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data tahun ajaran baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data tahun ajaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async edit({ inertia, params, session }: HttpContext) {
    const tahunAjaran = await DataTahunAjaran.query().where('id', params.id).firstOrFail()
    const users = await User.query().select(['id', 'fullName']).where('role', 'SuperAdmin')
    return inertia.render('TahunAjaran/Edit', {
      tahunAjaran,
      users,
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(tahunAjaranValidator)

      const tahunAjaran = await DataTahunAjaran.query().where('id', id).firstOrFail()

      tahunAjaran.useTransaction(trx)
      tahunAjaran.merge(payload as any)
      await tahunAjaran.save()

      await trx.commit()
      await cache.clear()
      session.flash({
        status: 'success',
        message: 'Data tahun ajaran berhasil diperbarui.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-tahun-ajaran')
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data tahun ajaran ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data tahun ajaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const tahunAjaran = await DataTahunAjaran.findOrFail(id)
      await tahunAjaran.delete()
      await cache.clear()
      session.flash({
        status: 'success',
        message: 'Data tahun ajaran berhasil dihapus.',
      })
    } catch (error) {
      logger.error({ err: error }, `Gagal hapus data tahun ajaran`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data tahun ajaran',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }
}
