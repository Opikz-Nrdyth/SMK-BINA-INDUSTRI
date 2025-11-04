import DataAbsensi from '#models/data_absensi'
import User from '#models/user'
import DataMapel from '#models/data_mapel'
import DataKelas from '#models/data_kelas'
import DataSiswa from '#models/data_siswa'
import DataGuru from '#models/data_guru'
import {
  absensiValidator,
  absensiBulkValidator,
  absensiUpdateValidator,
} from '#validators/data_absensi'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class DataAbsensiController {
  public async index({ request, inertia, session, auth }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const kelasId = request.input('kelasId', '')
    const tanggal = request.input('tanggal', DateTime.now().toISODate())

    const [totalAbsensi] = await Promise.all([DataAbsensi.query().count('* as total').first()])

    // Kontrol akses kelas berdasarkan user
    let accessibleKelasIds: string[] = []
    let accessibleMapelIds: number[] = []

    // Jika user adalah guru, tampilkan kelas yang dia wali DAN kelas yang dia ampu
    if (auth.user?.role === 'Guru') {
      const guru = await DataGuru.query().where('userId', auth.user.id).first()
      if (guru) {
        // Kelas dimana guru sebagai wali kelas
        const kelasWali = await DataKelas.query().where('waliKelas', guru.nip).select('id')

        // Kelas dimana guru sebagai guru pengampu (bukan wali kelas)
        const kelasDiampu = await DataKelas.query()
          .whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [`"${guru.nip}"`])
          .select('id')

        // Gabungkan semua kelas yang bisa diakses
        accessibleKelasIds = [...kelasWali.map((k) => k.id), ...kelasDiampu.map((k) => k.id)]

        // Hapus duplikat jika ada
        accessibleKelasIds = [...new Set(accessibleKelasIds)]

        const mapelAmpu = await DataMapel.query()
          .whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${guru.nip}"`])
          .select('id')
        accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
      }
    } else if (auth.user?.role === 'SuperAdmin') {
      // Admin bisa akses semua kelas
      const semuaKelas = await DataKelas.query().select('id')
      accessibleKelasIds = semuaKelas.map((k) => k.id)

      const mapelAmpu = await DataMapel.query().select('id')
      accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
    }

    const query = DataAbsensi.query()
      .preload('user', (user) => user.select(['id', 'fullName']))
      .preload('mapel', (mapel) => mapel.select(['id', 'namaMataPelajaran']))
      .preload('kelas', (kelas) => kelas.select(['id', 'namaKelas']))

    // Filter berdasarkan kelas yang bisa diakses
    if (!kelasId && accessibleKelasIds.length > 0) {
      query.whereIn('kelas_id', accessibleKelasIds)
    }

    if (kelasId) {
      query.where('kelas_id', kelasId)
    }

    if (tanggal) {
      const date = DateTime.fromISO(tanggal).toFormat('yyyy-MM-dd')
      query.where('hari', 'LIKE', `${date}%`)
    }

    if (search) {
      query.where((builder) => {
        builder
          .whereHas('user', (userQuery) => {
            userQuery.where('full_name', 'LIKE', `%${search}%`)
          })
          .orWhereHas('mapel', (mapelQuery) => {
            mapelQuery.where('nama_mata_pelajaran', 'LIKE', `%${search}%`)
          })
          .orWhereHas('kelas', (kelasQuery) => {
            kelasQuery.where('nama_kelas', 'LIKE', `%${search}%`)
          })
          .orWhere('status', 'LIKE', `%${search}%`)
      })
    }

    const absensiPaginate = await query
      .orderBy('hari', 'desc')
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalAbsensi?.$extras.total) || 1 : 15)

    const absensi = absensiPaginate.all().map((item) => item.toJSON())

    const data = absensi.map((item: any) => ({
      ...item,
      userName: item?.user?.fullName,
      mapelName: item?.mapel?.namaMataPelajaran,
      kelasName: item?.kelas?.namaKelas,
    }))

    // Get accessible classes for filter
    const accessibleKelas = await DataKelas.query()
      .whereIn('id', accessibleKelasIds)
      .select(['id', 'namaKelas'])
      .orderBy('namaKelas')

    const accessibleMapel = await DataMapel.query()
      .whereIn('id', accessibleMapelIds)
      .select(['id', 'namaMataPelajaran'])
      .orderBy('namaMataPelajaran')

    return inertia.render('Absensi/Index', {
      absensiPaginate: {
        currentPage: absensiPaginate.currentPage,
        lastPage: absensiPaginate.lastPage,
        total: absensiPaginate.total,
        perPage: absensiPaginate.perPage,
        firstPage: 1,
        nextPage:
          absensiPaginate.currentPage < absensiPaginate.lastPage
            ? absensiPaginate.currentPage + 1
            : null,
        previousPage: absensiPaginate.currentPage > 1 ? absensiPaginate.currentPage - 1 : null,
      },
      absensi: data,
      accessibleKelas,
      accessibleMapel,
      filter: { kelasId, tanggal },
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async getSiswaByKelas({ params, response }: HttpContext) {
    const { kelasId } = params

    try {
      const kelas = await DataKelas.findOrFail(kelasId)

      const siswaNisns = Array.isArray(kelas.siswa) ? kelas.siswa : JSON.parse(kelas.siswa || '[]')

      const siswa = await DataSiswa.query()
        .whereIn('nisn', siswaNisns)
        .preload('user', (user) => user.select(['id', 'fullName']))
        .select(['nisn', 'userId'])
        .orderBy('nisn')

      const data = siswa.map((s) => ({
        userId: s.userId,
        fullName: s.user.fullName,
        nisn: s.nisn,
        status: 'Hadir', // Default status
      }))

      return response.json(data)
    } catch (error) {
      logger.error({ err: error }, 'Gagal memuat data siswa')
      return response.status(404).json({ error: 'Kelas tidak ditemukan' })
    }
  }

  public async view({ inertia, request, params, session }: HttpContext) {
    const { userId } = params
    const page = request.input('page', 1)

    const query = DataAbsensi.query()
      .preload('user', (user) => user.select(['id', 'fullName']))
      .preload('mapel', (mapel) => mapel.select(['id', 'namaMataPelajaran']))
      .preload('kelas', (kelas) => kelas.select(['id', 'namaKelas']))
      .where('userId', userId)

    const result = await query
      .orderBy('hari', 'desc')
      .orderBy('created_at', 'desc')
      .paginate(page, 15)

    const absensi = result.all().map((item) => item.toJSON())

    const data = absensi.map((item: any) => ({
      ...item,
      userName: item?.user?.fullName,
      mapelName: item?.mapel?.namaMataPelajaran,
      kelasName: item?.kelas?.namaKelas,
    }))

    return inertia.render('Absensi/Siswa', {
      absensiPaginate: result,
      absensi: data,
      session: session.flashMessages.all(),
    })
  }

  public async create({ inertia, auth, session }: HttpContext) {
    // Kontrol akses kelas berdasarkan user
    let accessibleKelasIds: string[] = []
    let accessibleMapelIds: number[] = []
    if (auth.user?.role === 'Guru') {
      const guru = await DataGuru.query().where('userId', auth.user.id).first()
      if (guru) {
        // Kelas dimana guru sebagai guru pengampu (bukan wali kelas)
        const kelasDiampu = await DataKelas.query()
          .whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [`"${guru.nip}"`])
          .select('id')

        // Gabungkan semua kelas yang bisa diakses
        accessibleKelasIds = [...kelasDiampu.map((k) => k.id)]
        accessibleKelasIds = [...new Set(accessibleKelasIds)]

        const mapelAmpu = await DataMapel.query()
          .whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${guru.nip}"`])
          .select('id')

        accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
      }
    } else if (auth.user?.role === 'SuperAdmin') {
      // Admin bisa akses semua kelas
      const semuaKelas = await DataKelas.query().select('id')
      accessibleKelasIds = semuaKelas.map((k) => k.id)
      const mapelAmpu = await DataMapel.query().select('id')
      mapelAmpu.map((m) => m.id).filter((id) => id !== null)
    }

    const accessibleKelas = await DataKelas.query()
      .whereIn('id', accessibleKelasIds)
      .select(['id', 'namaKelas'])
      .orderBy('namaKelas')

    let mapelsQuery = DataMapel.query().select(['id', 'namaMataPelajaran'])
    if (auth.user?.role === 'Guru') {
      mapelsQuery = mapelsQuery.whereIn('id', accessibleMapelIds)
    }
    const mapels = await mapelsQuery

    return inertia.render('Absensi/Create', {
      accessibleKelas,
      mapels,
      today: DateTime.now().toISODate(),
      session: session.flashMessages.all(),
    })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(absensiValidator)
      const tanggal = DateTime.fromISO(payload.tanggal)

      const absensiData = payload.absensi.map((item) => ({
        userId: item.userId,
        mapelId: payload.mapelId,
        kelasId: payload.kelasId,
        status: item.status,
        hari: tanggal,
        created_at: DateTime.now(),
        updated_at: DateTime.now(),
      }))

      const duplicateChecks = await Promise.all(
        absensiData.map(async (item) => {
          const date = DateTime.fromISO(String(item.hari)).toFormat('yyyy-MM-dd')
          const existing = await DataAbsensi.query()
            .where('userId', item.userId)
            .where('mapelId', item.mapelId)
            .where('kelasId', item.kelasId)
            .where('hari', 'LIKE', `${DateTime.fromISO(date).toFormat('yyyy-MM-dd')}%`) // Bandingkan berdasarkan tanggal
            .first()

          return {
            userId: item.userId,
            exists: !!existing,
            existingData: existing,
          }
        })
      )

      const duplicates = duplicateChecks.filter((check) => check.exists)

      if (duplicates.length > 0) {
        // Ambil nama siswa yang duplicate untuk pesan error
        const duplicateUserIds = duplicates.map((d) => d.userId)
        const duplicateUsers = await User.query()
          .whereIn('id', duplicateUserIds)
          .select(['id', 'fullName'])

        const duplicateNames = duplicateUsers.map((user) => user.fullName).join(', ')

        await trx.rollback()

        session.flash({
          status: 'error',
          message: `Data absensi untuk ${duplicateNames} sudah ada pada tanggal tersebut.`,
        })

        logger.error(`Data absensi untuk ${duplicateNames} sudah ada pada tanggal tersebut.`)

        return response.redirect().withQs().back()
      }

      // Check if we should save to offline storage (if user is offline)
      const isOnline = request.header('X-Online-Status') !== 'false'

      if (!isOnline) {
        const pendingData = await this.getPendingAbsensiFromStorage()

        const offlineDuplicates = absensiData.filter((item) =>
          pendingData.some(
            (pending) =>
              pending.userId === item.userId &&
              pending.mapelId === item.mapelId &&
              pending.kelasId === item.kelasId &&
              pending.hari === item.hari.toISODate()
          )
        )

        if (offlineDuplicates.length > 0) {
          await trx.rollback()
          return response.json({
            success: false,
            offline: true,
            error: 'Beberapa data sudah ada dalam antrian offline',
          })
        }

        await trx.rollback() // Rollback transaction karena kita tidak save ke database

        return response.json({
          success: true,
          offline: true,
          message: `Data absensi berhasil disimpan secara offline untuk ${absensiData.length} siswa.`,
          data: absensiData.map((item) => ({
            ...item,
            hari: item.hari.toISODate(), // Convert back to string untuk offline storage
          })),
        })
      } else {
        // Save ke database
        await DataAbsensi.createMany(absensiData, { client: trx })
        await trx.commit()

        session.flash({
          status: 'success',
          message: `Data absensi berhasil disimpan untuk ${absensiData.length} siswa.`,
        })
        return response.redirect().toPath('/SuperAdmin/laporan-absensi')
      }
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data absensi')

      // Return error response untuk offline case
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(500).json({
          success: false,
          error: `Terjadi kesalahan: ${error.message || 'Data tidak valid.'}`,
        })
      }

      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data absensi',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async storeBulk({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(absensiBulkValidator)

      const absensiData = payload.absensi.map((item) => ({
        ...item,
        hari: DateTime.fromISO(item.hari),
        created_at: DateTime.now(),
        updated_at: DateTime.now(),
      }))

      await DataAbsensi.createMany(absensiData, { client: trx })

      await trx.commit()

      // Clear synced data from offline storage
      // This will be handled by the frontend after successful sync

      session.flash({
        status: 'success',
        message: 'Berhasil Mensinkronkan data',
      })
      return response.redirect().withQs().back()
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data absensi bulk')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data absensi',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async edit({ inertia, params, session, response, auth }: HttpContext) {
    const absensi = await DataAbsensi.findOrFail(params.id)

    // Kontrol akses berdasarkan kelas
    let accessibleKelasIds: string[] = []
    let accessibleMapelIds: number[] = []

    console.log(accessibleKelasIds)
    console.log(accessibleMapelIds)

    if (auth.user?.role === 'Guru') {
      const guru = await DataGuru.query().where('userId', auth.user.id).first()
      if (guru) {
        // Kelas dimana guru sebagai guru pengampu (bukan wali kelas)
        const kelasDiampu = await DataKelas.query()
          .whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [`"${guru.nip}"`])
          .select('id')

        // Gabungkan semua kelas yang bisa diakses
        accessibleKelasIds = [...kelasDiampu.map((k) => k.id)]
        accessibleKelasIds = [...new Set(accessibleKelasIds)]

        const mapelAmpu = await DataMapel.query()
          .whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${guru.nip}"`])
          .select('id')

        accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
      }
    } else if (auth.user?.role === 'SuperAdmin') {
      // Admin bisa akses semua kelas
      const semuaKelas = await DataKelas.query().select('id')
      accessibleKelasIds = semuaKelas.map((k) => k.id)
      const mapelAmpu = await DataMapel.query().select('id')

      accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
    }

    if (accessibleKelasIds.length > 0 && !accessibleKelasIds.includes(absensi.kelasId)) {
      session.flash({
        status: 'error',
        message: 'Anda tidak memiliki akses ke data absensi ini',
      })
      return response.redirect().withQs().back()
    }

    // Load related data dengan preload
    await absensi.load('user', (query) => query.select(['id', 'fullName']))
    await absensi.load('mapel', (query) => query.select(['id', 'namaMataPelajaran']))
    await absensi.load('kelas', (query) => query.select(['id', 'namaKelas']))

    const users = await User.query()
      .select(['id', 'fullName'])
      .where('id', absensi.userId)
      .where('role', 'siswa')
    let mapels = await DataMapel.query()
      .select(['id', 'namaMataPelajaran'])
      .where('id', absensi.mapelId)

    const accessibleKelas = await DataKelas.query()
      .where('id', absensi.kelasId)
      .select(['id', 'namaKelas'])

    const absensiData = {
      id: absensi.id,
      userId: absensi.userId,
      mapelId: absensi.mapelId,
      kelasId: absensi.kelasId,
      status: absensi.status,
      hari: absensi.hari ? absensi.hari.toISODate() : '',
      userName: absensi.user?.fullName,
      mapelName: absensi.mapel?.namaMataPelajaran,
      kelasName: absensi.kelas?.namaKelas,
      createdAt: absensi.createdAt,
      updatedAt: absensi.updatedAt,
    }

    return inertia.render('Absensi/Edit', {
      absensi: absensiData,
      users,
      mapels,
      accessibleKelas,
      session: session.flashMessages.all(),
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const absensi = await DataAbsensi.findOrFail(id)

      // Kontrol akses
      let accessibleKelasIds: string[] = []
      // if (auth.user?.role === 'guru') {
      //   const guru = await DataGuru.query().where('userId', auth.user.id).first()
      //   if (guru) {
      //     const kelasGuru = await DataKelas.query().where('waliKelas', guru.nip).select('id')
      //     accessibleKelasIds = kelasGuru.map((k) => k.id)
      //   }
      // } else if (auth.user?.role === 'admin') {
      //   const semuaKelas = await DataKelas.query().select('id')
      //   accessibleKelasIds = semuaKelas.map((k) => k.id)
      // }
      const semuaKelas = await DataKelas.query().select('id')
      accessibleKelasIds = semuaKelas.map((k) => k.id)

      if (accessibleKelasIds.length > 0 && !accessibleKelasIds.includes(absensi.kelasId)) {
        throw new Error('Anda tidak memiliki akses ke data absensi ini')
      }

      const payload = await request.validateUsing(absensiUpdateValidator)
      absensi.useTransaction(trx)

      // Convert hari string to DateTime
      const updateData = {
        ...payload,
        hari: DateTime.fromISO(payload.hari),
      }

      absensi.merge(updateData as any)
      await absensi.save()

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data absensi berhasil diperbarui.',
      })
      return response.redirect().toPath('/SuperAdmin/laporan-absensi')
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data absensi ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data absensi',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, auth, params }: HttpContext) {
    const trx = await db.transaction()

    try {
      const absensi = await DataAbsensi.findOrFail(params.id)

      // Kontrol akses berdasarkan kelas
      let accessibleKelasIds: string[] = []
      let accessibleMapelIds: number[] = []

      console.log(accessibleKelasIds)
      console.log(accessibleMapelIds)

      if (auth.user?.role === 'Guru') {
        const guru = await DataGuru.query().where('userId', auth.user.id).first()
        if (guru) {
          // Kelas dimana guru sebagai guru pengampu (bukan wali kelas)
          const kelasDiampu = await DataKelas.query()
            .whereRaw('JSON_CONTAINS(guru_pengampu, ?)', [`"${guru.nip}"`])
            .select('id')

          // Gabungkan semua kelas yang bisa diakses
          accessibleKelasIds = [...kelasDiampu.map((k) => k.id)]
          accessibleKelasIds = [...new Set(accessibleKelasIds)]

          const mapelAmpu = await DataMapel.query()
            .whereRaw('JSON_CONTAINS(guru_ampu, ?)', [`"${guru.nip}"`])
            .select('id')

          accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
        }
      } else if (auth.user?.role === 'SuperAdmin') {
        // Admin bisa akses semua kelas
        const semuaKelas = await DataKelas.query().select('id')
        accessibleKelasIds = semuaKelas.map((k) => k.id)
        const mapelAmpu = await DataMapel.query().select('id')

        accessibleMapelIds = mapelAmpu.map((m) => m.id).filter((id) => id !== null)
      }

      if (accessibleKelasIds.length > 0 && !accessibleKelasIds.includes(absensi.kelasId)) {
        session.flash({
          status: 'error',
          message: 'Anda tidak memiliki akses ke data absensi ini',
        })
        return response.redirect().withQs().back()
      }

      absensi.useTransaction(trx)
      await absensi.delete()

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data absensi berhasil dihapus.',
      })
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal hapus data absensi`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data absensi',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }

  /**
   * API untuk mendapatkan statistik data offline
   */
  public async getOfflineStats({ response }: HttpContext) {
    try {
      // Endpoint ini bisa digunakan frontend untuk mengecek status data offline
      return response.json({
        success: true,
        message: 'Offline storage API ready',
      })
    } catch (error: any) {
      logger.error({ err: error }, 'Error getting offline stats')
      return response.status(500).json({
        success: false,
        error: 'Internal server error',
      })
    }
  }

  private async getPendingAbsensiFromStorage(): Promise<any[]> {
    // Method ini hanya untuk ilustrasi
    // Di implementasi sebenarnya, frontend yang akan handle ini
    return []
  }
}
