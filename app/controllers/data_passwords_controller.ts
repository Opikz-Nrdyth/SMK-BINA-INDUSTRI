import BankSoal from '#models/bank_soal'
import DataPassword from '#models/data_password'
import type { HttpContext } from '@adonisjs/core/http'

export default class DataPasswordsController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const query = DataPassword.query()

    if (search) {
      query.where('kode', 'LIKE', `%${search}%`)
    }

    // pagination server-side
    const paginate = await query.orderBy('id', 'desc').paginate(page, 15)
    const passwords = paginate.all().map((item) => item.toJSON())

    const startNumber = (page - 1) * 15 + 1
    // mapping ujian → ubah JSON string jadi array of ID
    const processed = passwords.map((d: any, index: number) => ({
      ...d,
      ujian: d.ujian,
      nomor: startNumber + index,
    }))

    const bankSoals = await BankSoal.query().select(['id', 'namaUjian', 'mapelId']).preload('mapel')

    // ubah array ujian ID → string nama ujian
    const data = processed.map((d: any) => {
      const ujianNames = d.ujian
        .map((id: number) => {
          const b = bankSoals.find((x: any) => x.id === id)
          return b ? b.namaUjian : `#${id}`
        })
        .join(', ')

      const ujian = d.ujian.map((id: number) => {
        const b = bankSoals.find((x: any) => x.id === id)
        return { mapel: b?.mapel.namaMataPelajaran, jenjang: b?.mapel.jenjang }
      })

      return { ...d, ujianNames, mapel: ujian[0].mapel, jenjang: ujian[0].jenjang }
    })

    return inertia.render('DataPasswords/Index', {
      dataPasswords: data,
      bankSoals,
      session: session.flashMessages.all(),
      searchQuery: search,
      pagination: {
        currentPage: paginate.currentPage,
        lastPage: paginate.lastPage,
        total: paginate.total,
        perPage: paginate.perPage,
        nextPage: paginate.currentPage < paginate.lastPage ? paginate.currentPage + 1 : null,
        previousPage: paginate.currentPage > 1 ? paginate.currentPage - 1 : null,
      },
    })
  }

  public async store({ request, response }: HttpContext) {
    const { password, ujian } = request.only(['password', 'ujian'])
    DataPassword.create({
      kode: password,
      ujian: ujian,
    })
    return response.redirect().back()
  }

  public async update({ params, request, response }: HttpContext) {
    const { password, ujian } = request.only(['password', 'ujian'])
    const data = await DataPassword.findOrFail(params.id)
    data.kode = password
    data.ujian = ujian
    await data.save()
    return response.redirect().back()
  }

  public async destroy({ params, response }: HttpContext) {
    const data = await DataPassword.findOrFail(params.id)
    await data.delete()
    return response.redirect().back()
  }
}
