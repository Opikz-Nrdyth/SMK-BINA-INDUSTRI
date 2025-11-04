import DataInformasi from '#models/data_informasi'
import DataSiswa from '#models/data_siswa'
import DataGuru from '#models/data_guru'
import { informasiValidator } from '#validators/data_informasi'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class DataInformasiController {
  public async index({ request, inertia, session, auth }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const [totalInformasi] = await Promise.all([DataInformasi.query().count('* as total').first()])

    const query = DataInformasi.query()

    if (search) {
      query.where((builder) => {
        builder.where('judul', 'LIKE', `%${search}%`).orWhere('deskripsi', 'LIKE', `%${search}%`)
      })
    }

    if (auth.user?.role == 'Guru') {
      query.whereIn('roleTujuan', ['guru', 'semua'])
    }

    const informasiPaginate = await query
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalInformasi?.$extras.total) || 1 : 15)

    const informasi = informasiPaginate.all().map((item) => item.toJSON())

    return inertia.render('Informasi/Index', {
      informasiPaginate: {
        currentPage: informasiPaginate.currentPage,
        lastPage: informasiPaginate.lastPage,
        total: informasiPaginate.total,
        perPage: informasiPaginate.perPage,
        firstPage: 1,
        nextPage:
          informasiPaginate.currentPage < informasiPaginate.lastPage
            ? informasiPaginate.currentPage + 1
            : null,
        previousPage: informasiPaginate.currentPage > 1 ? informasiPaginate.currentPage - 1 : null,
      },
      informasi: informasi,
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async create({ inertia, session }: HttpContext) {
    async function getContacts(model: any) {
      const list = await model.query().whereNotNull('noTelepon').preload('user')
      return list.map((item: any) => ({
        fullName: item.user.fullName,
        noTelephone: item.noTelepon,
        role: item.user.role,
      }))
    }

    const [dataGuru, dataSiswa] = await Promise.all([getContacts(DataGuru), getContacts(DataSiswa)])

    const allContacts = [...dataGuru, ...dataSiswa]
    return inertia.render('Informasi/Create', {
      session: session.flashMessages.all(),
      allContacts,
    })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(informasiValidator)

      await DataInformasi.create(payload, { client: trx })

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data informasi berhasil ditambahkan.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-informasi')
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data informasi baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data informasi',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async edit({ inertia, params, session }: HttpContext) {
    async function getContacts(model: any) {
      const list = await model.query().whereNotNull('noTelepon').preload('user')
      return list.map((item: any) => ({
        fullName: item.user.fullName,
        noTelephone: item.noTelepon,
        role: item.user.role,
      }))
    }

    const [dataGuru, dataSiswa] = await Promise.all([getContacts(DataGuru), getContacts(DataSiswa)])

    const allContacts = [...dataGuru, ...dataSiswa]
    const informasi = await DataInformasi.query().where('id', params.id).firstOrFail()
    return inertia.render('Informasi/Edit', {
      informasi,
      allContacts,
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(informasiValidator)

      const informasi = await DataInformasi.query().where('id', id).firstOrFail()

      informasi?.useTransaction(trx)
      informasi?.merge(payload as any)
      await informasi?.save()

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data informasi berhasil diperbarui.',
      })
      return response.redirect().toPath('/SuperAdmin/manajemen-informasi')
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data informasi ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data informasi',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const informasi = await DataInformasi.findOrFail(id)
      await informasi.delete()

      session.flash({
        status: 'success',
        message: 'Data informasi berhasil dihapus.',
      })
    } catch (error) {
      logger.error({ err: error }, `Gagal hapus data informasi`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data informasi',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }
}
