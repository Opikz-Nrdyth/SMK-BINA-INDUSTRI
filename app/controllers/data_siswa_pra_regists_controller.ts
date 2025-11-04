import DataKelas from '#models/data_kelas'
import DataSiswa from '#models/data_siswa'
import type { HttpContext } from '@adonisjs/core/http'

export default class DataSiswaPraRegistsController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const semuaKelas = await DataKelas.all()

    const mapNisnToKelas = new Map<string, string>()
    for (const kelas of semuaKelas) {
      const siswaArray =
        typeof kelas.siswa === 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa
      siswaArray.forEach((nisn: string) => {
        mapNisnToKelas.set(nisn, kelas.namaKelas)
      })
    }

    // Query untuk siswa dengan status praregist atau daftarulang
    const [totalSiswa] = await Promise.all([
      DataSiswa.query().whereIn('status', ['praregist', 'daftarulang']).count('* as total').first(),
    ])

    const query = DataSiswa.query()
      .whereIn('status', ['praregist', 'daftarulang'])
      .preload('user')
      .preload('dataWalis')

    if (search) {
      query.where((builder) => {
        builder
          .where('nisn', 'LIKE', `%${search}%`)
          .orWhereHas('user', (userQuery) => {
            userQuery
              .where('full_name', 'LIKE', `%${search}%`)
              .orWhere('email', 'LIKE', `%${search}%`)
          })
          .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
          .orWhere('sekolah_asal', 'LIKE', `%${search}%`)
      })
    }

    const siswaPaginate = await query
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalSiswa?.$extras.total) || 1 : 15)

    const sortedSiswa = siswaPaginate.all().sort((a, b) => {
      const nameA = a.user?.fullName?.toLowerCase() || ''
      const nameB = b.user?.fullName?.toLowerCase() || ''
      return nameA.localeCompare(nameB)
    })

    const startNumber = (page - 1) * 15 + 1

    const siswas = sortedSiswa.map((siswa, index) => {
      const raw = siswa.toJSON()
      const namaKelas = mapNisnToKelas.get(siswa.nisn) || '-'

      // Susun ulang properti
      const sorted: Record<string, any> = {}

      // User data
      if (raw.user) sorted.user = raw.user

      // nama kelas
      sorted.nama_kelas = namaKelas
      sorted.nomor = startNumber + index

      // Semua string
      for (const [key, value] of Object.entries(raw)) {
        if (typeof value === 'string' && key !== 'userId') {
          sorted[key] = value
        }
      }

      // property non-string (object, array, date, number, null, dsb)
      for (const [key, value] of Object.entries(raw)) {
        if (typeof value !== 'string' && key !== 'user') {
          sorted[key] = value
        }
      }

      return sorted
    })

    return inertia.render('Siswa/PraRegist', {
      siswaPaginate: {
        currentPage: siswaPaginate.currentPage,
        lastPage: siswaPaginate.lastPage,
        total: siswaPaginate.total,
        perPage: siswaPaginate.perPage,
        firstPage: 1,
        nextPage:
          siswaPaginate.currentPage < siswaPaginate.lastPage ? siswaPaginate.currentPage + 1 : null,
        previousPage: siswaPaginate.currentPage > 1 ? siswaPaginate.currentPage - 1 : null,
      },
      siswas: siswas,
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async updateStatus({ params, response, session }: HttpContext) {
    try {
      const { nisn } = params

      // Cari siswa berdasarkan NISN
      const siswa = await DataSiswa.findBy('nisn', nisn)

      if (!siswa) {
        session.flash('error', 'Siswa tidak ditemukan')
        return response.redirect().withQs().back()
      }

      // Pastikan hanya siswa dengan status praregist atau daftarulang yang bisa diubah
      if (!['praregist', 'daftarulang'].includes(siswa.status as string)) {
        session.flash(
          'error',
          'Hanya siswa dengan status praregist atau daftarulang yang dapat diubah'
        )
        return response.redirect().withQs().back()
      }

      // Ubah status menjadi 'siswa' (aktif)
      siswa.status = 'siswa'
      await siswa.save()

      session.flash('success', `Status siswa ${siswa.nisn} berhasil diubah menjadi siswa aktif`)
      return response.redirect().withQs().back()
    } catch (error) {
      session.flash('error', 'Terjadi kesalahan saat mengubah status siswa')
      return response.redirect().withQs().back()
    }
  }

  public async updateToDaftarUlang({ params, response, session }: HttpContext) {
    try {
      const { nisn } = params

      const siswa = await DataSiswa.findBy('nisn', nisn)

      if (!siswa) {
        session.flash('error', 'Siswa tidak ditemukan')
        return response.redirect().withQs().back()
      }

      if (siswa.status !== 'praregist') {
        session.flash(
          'error',
          'Hanya siswa dengan status praregist yang dapat diubah menjadi daftarulang'
        )
        return response.redirect().withQs().back()
      }

      siswa.status = 'siswa'
      await siswa.save()

      session.flash('success', `Status siswa ${siswa.nisn} berhasil diubah menjadi daftarulang`)
      return response.redirect().withQs().back()
    } catch (error) {
      session.flash('error', 'Terjadi kesalahan saat mengubah status siswa')
      return response.redirect().withQs().back()
    }
  }
}
