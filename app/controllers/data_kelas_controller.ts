import DataGuru from '#models/data_guru'
import DataJurusan from '#models/data_jurusan'
import DataKelas from '#models/data_kelas'
import DataMapel from '#models/data_mapel'
import DataSiswa from '#models/data_siswa'
import { kelasValidator } from '#validators/data_kelas'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'

export default class DataKelasController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const [totalKelas] = await Promise.all([DataKelas.query().count('* as total').first()])

    const query = DataKelas.query().preload('guru', (guru) => {
      guru
        .preload('user', (user) => user.select(['fullName']))
        .select(['userId', 'gelarDepan', 'gelarBelakang'])
    })

    if (search) {
      query.where((builder) => {
        builder
          .where('nama_kelas', 'LIKE', `%${search}%`)
          .orWhere('jenjang', 'LIKE', `%${search}%`)
          .orWhereHas('guru', (guruQuery) => {
            guruQuery.whereHas('user', (userQuery) => {
              userQuery.where('full_name', 'LIKE', `%${search}%`)
            })
          })
      })
    }

    const kelasPaginate = await query
      .orderBy('jenjang', 'desc')
      .paginate(page, search ? Number(totalKelas?.$extras.total) || 1 : 15)

    const kelas = kelasPaginate.all().map((item) => item.toJSON())

    const newKelasData = await Promise.all(
      kelas.map(async (item) => {
        const nisns: string[] = Array.isArray(item.siswa) ? item.siswa : []
        const siswaData = nisns.length
          ? await DataSiswa.query()
              .preload('user', (user) => user.select(['fullName', 'id']))
              .select(['nisn', 'userId'])
              .whereIn('nisn', nisns)
          : []
        return { ...item, siswaData }
      })
    )

    const data = await Promise.all(
      newKelasData.map((dKelas: any) => ({
        ...dKelas,
        waliName: dKelas?.guru?.user?.fullName,
        waliKelas: {
          userId: dKelas?.guru?.userId,
          nip: dKelas?.guru?.nip,
          gelarDepan: dKelas?.guru?.gelarDepan,
          gelarBelakang: dKelas?.guru?.gelarBelakang,
          fullName: dKelas?.guru?.user?.fullName,
        },
        dataSiswa: dKelas?.siswaData?.map((dSiswa: any) => ({
          nisn: dSiswa.nisn,
          userId: dSiswa.userId,
          fullName: dSiswa?.user?.fullName,
        })),
      }))
    )

    logger.info('Jumlah Kelas: ', Number(totalKelas?.$extras.total))
    return inertia.render('Kelas/Index', {
      kelasPaginate: {
        currentPage: kelasPaginate.currentPage,
        lastPage: kelasPaginate.lastPage,
        total: kelasPaginate.total,
        perPage: kelasPaginate.perPage,
        firstPage: 1,
        nextPage:
          kelasPaginate.currentPage < kelasPaginate.lastPage ? kelasPaginate.currentPage + 1 : null,
        previousPage: kelasPaginate.currentPage > 1 ? kelasPaginate.currentPage - 1 : null,
      },
      kelas: data,
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async create({ inertia, session }: HttpContext) {
    const dataGuru = await DataGuru.query()
      .select(['nip', 'userId'])
      .preload('user', (user) => user.select(['fullName']))

    // Dapatkan semua NIP
    const nips = dataGuru.map((guru) => guru.nip)

    // Query dengan nama kolom yang benar: 'guru_ampu'
    const semuaMapel = await DataMapel.query().select([
      'id',
      'namaMataPelajaran',
      'jenjang',
      'guru_ampu',
    ])

    // Atau jika ingin menggunakan WHERE condition, gunakan nama kolom yang benar:
    await DataMapel.query()
      .select(['id', 'namaMataPelajaran', 'jenjang', 'guru_ampu'])
      .where((query) => {
        nips.forEach((nip, index) => {
          if (index === 0) {
            query.whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${nip}"`])
          } else {
            query.orWhereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${nip}"`])
          }
        })
      })

    // Lanjutkan dengan processing seperti sebelumnya...
    const mapelByNip = {} as any

    semuaMapel.forEach((mapel) => {
      const guruAmpuArray =
        typeof mapel.guruAmpu == 'string' ? JSON.parse(mapel.guruAmpu) : mapel.guruAmpu

      guruAmpuArray.forEach((nip: any) => {
        if (!mapelByNip[nip]) mapelByNip[nip] = []
        mapelByNip[nip].push({
          id: mapel.id,
          namaMataPelajaran: mapel.namaMataPelajaran,
          jenjang: mapel.jenjang,
        })
      })
    })

    const guruWithMapel = dataGuru.map((guru) => ({
      nip: guru.nip,
      userId: guru.userId,
      fullName: guru.user.fullName,
      mataPelajaran: mapelByNip[guru.nip] || null,
    }))

    const dataSiswa = await DataSiswa.query()
      .select(['nisn', 'userId'])
      .where('status', 'siswa')
      .preload('user', (user) => user.select(['fullName']))

    const dataKelas = await DataKelas.query().select('siswa')

    const siswaTerdaftar = dataKelas.flatMap((k) => k.siswa)

    const siswaBelumTerdaftar = dataSiswa.filter((siswa) => !siswaTerdaftar.includes(siswa.nisn))

    return inertia.render('Kelas/Create', {
      guruWithMapel,
      dataSiswa: siswaBelumTerdaftar,
      session: session.flashMessages.all(),
    })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(kelasValidator)

      const newPayload = {
        ...payload,
        siswa: JSON.stringify(payload.siswa),
        guruPengampu: JSON.stringify(payload.guruPengampu),
      }

      await DataKelas.create(newPayload, { client: trx })

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data kelas berhasil ditambahkan.',
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data kelas baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data kelas',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async edit({ inertia, params, session }: HttpContext) {
    const kelas = await DataKelas.query().where('id', params.id).firstOrFail()
    const dataGuru = await DataGuru.query()
      .select(['nip', 'userId'])
      .preload('user', (user) => user.select(['fullName']))

    // Dapatkan semua NIP
    const nips = dataGuru.map((guru) => guru.nip)

    // Query dengan nama kolom yang benar: 'guru_ampu'
    const semuaMapel = await DataMapel.query().select([
      'id',
      'namaMataPelajaran',
      'jenjang',
      'guru_ampu',
    ])

    // Atau jika ingin menggunakan WHERE condition, gunakan nama kolom yang benar:
    await DataMapel.query()
      .select(['id', 'namaMataPelajaran', 'jenjang', 'guru_ampu'])
      .where((query) => {
        nips.forEach((nip, index) => {
          if (index === 0) {
            query.whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${nip}"`])
          } else {
            query.orWhereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${nip}"`])
          }
        })
      })

    const mapelByNip = {} as any

    semuaMapel.forEach((mapel) => {
      const guruAmpuArray =
        typeof mapel.guruAmpu == 'string' ? JSON.parse(mapel.guruAmpu) : mapel.guruAmpu

      guruAmpuArray.forEach((nip: any) => {
        if (!mapelByNip[nip]) mapelByNip[nip] = []
        mapelByNip[nip].push({
          id: mapel.id,
          namaMataPelajaran: mapel.namaMataPelajaran,
          jenjang: mapel.jenjang,
        })
      })
    })

    const guruWithMapel = dataGuru.map((guru) => ({
      nip: guru.nip,
      userId: guru.userId,
      fullName: guru.user.fullName,
      mataPelajaran: mapelByNip[guru.nip] || null,
    }))
    const dataSiswa = await DataSiswa.query()
      .select(['nisn', 'userId'])
      .where('status', 'siswa')
      .preload('user', (user) => user.select(['fullName']))
    return inertia.render('Kelas/Edit', {
      kelas,
      guruWithMapel,
      dataSiswa,
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(kelasValidator)

      const kelas = await DataKelas.query().where('id', id).firstOrFail()

      kelas?.useTransaction(trx)
      const newPayload = {
        ...payload,
        siswa: JSON.stringify(payload.siswa),
        guruPengampu: JSON.stringify(payload.guruPengampu),
      }
      kelas?.merge(newPayload)
      await kelas?.save()

      await trx.commit()

      session.flash({
        status: 'success',
        message: 'Data kelas berhasil diperbarui.',
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data kelas ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data kelas',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const kelas = await DataKelas.findOrFail(id)
      const dataJurusan = await DataJurusan.query()
      for (const jurusan of dataJurusan) {
        const jurusans: any[] =
          typeof jurusan.kelasId === 'string' ? [jurusan.kelasId] : jurusan.kelasId

        if (Array.isArray(jurusans)) {
          const filtered = jurusans.filter((id: any) => id !== kelas.id)
          if (filtered.length !== jurusans.length) {
            jurusan.kelasId = filtered
            await jurusan.save()
          }
        }
      }
      await kelas.delete()

      session.flash({
        status: 'success',
        message: 'Data kelas berhasil dihapus.',
      })
    } catch (error) {
      logger.error({ err: error }, `Gagal hapus data kelas`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data kelas',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }
}
