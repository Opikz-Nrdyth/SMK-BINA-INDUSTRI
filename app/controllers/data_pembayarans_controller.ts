import DataPembayaran from '#models/data_pembayaran'
import User from '#models/user'

import {
  pembayaranValidator,
  pembayaranUpdateValidator,
  tambahPembayaranValidator,
} from '#validators/data_pembayaran'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import DataSiswa from '#models/data_siswa'
import DataGuru from '#models/data_guru'
import DataKelas from '#models/data_kelas'

export default class DataPembayaranController {
  public async index({ request, inertia, session, auth }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const jenisPembayaran = request.input('jenisPembayaran', '')
    const tanggal = request.input('tanggal', '')
    await auth.check()

    // TAMBAHAN: Ambil data kelas wali jika user adalah guru
    let nisnDiwali: string[] = []
    let accessibleKelasIds: string[] = []
    console.log(accessibleKelasIds)

    if (auth.user?.role === 'Guru') {
      const guru = await DataGuru.query().where('userId', auth.user.id).first()
      if (guru) {
        // Ambil kelas yang diwalikan
        const kelasWali = await DataKelas.query().where('waliKelas', guru.nip)

        // Ambil semua NISN siswa dari kelas yang diwalikan
        kelasWali.forEach((kelas) => {
          try {
            const siswaArray: string[] =
              typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa || '[]') : kelas.siswa
            nisnDiwali.push(...siswaArray)
          } catch (error) {
            logger.error({ err: error }, `Error parsing siswa data for kelas ${kelas.id}`)
          }
        })

        // Ambil ID kelas untuk filter tambahan
        accessibleKelasIds = kelasWali.map((kelas) => kelas.id)
      }
    }

    const [totalPembayaran] = await Promise.all([
      DataPembayaran.query().count('* as total').first(),
    ])

    const query = DataPembayaran.query().preload('user', (user) => {
      user.preload('dataSiswa')
      user.select(['id', 'fullName'])
    })

    // TAMBAHAN: Filter untuk guru - hanya tampilkan siswa dari kelas yang diwalikan
    if (auth.user?.role === 'Guru' && nisnDiwali.length > 0) {
      // APPROACH 1: Subquery untuk ambil user IDs yang punya dataSiswa dengan NISN yang sesuai
      const usersWithSiswa = await User.query()
        .whereHas('dataSiswa', (siswaQuery) => {
          siswaQuery.whereIn('nisn', nisnDiwali)
        })
        .select('id')

      const userIds = usersWithSiswa.map((user) => user.id)

      if (userIds.length > 0) {
        query.whereIn('user_id', userIds)
      } else {
        // Jika tidak ada user yang match, return empty result
        query.where('user_id', 'no-user-found')
      }
    }

    // Filter berdasarkan search (nama user)
    if (search) {
      query.whereHas('user', (userQuery) => {
        userQuery.where('fullName', 'LIKE', `%${search}%`)
      })
    }

    // Filter berdasarkan jenis pembayaran
    if (jenisPembayaran) {
      query.where('jenis_pembayaran', 'LIKE', `%${jenisPembayaran}%`)
    }

    // Filter berdasarkan tanggal pembayaran
    if (tanggal) {
      const dateString = DateTime.fromISO(tanggal).toISODate()
      query.whereRaw('JSON_EXTRACT(nominal_bayar, "$[*].tanggal") LIKE ?', [`%${dateString}%`])
    }

    const pembayaranPaginate = await query
      .orderBy('created_at', 'desc')
      .paginate(page, search ? Number(totalPembayaran?.$extras.total) || 1 : 15)

    const pembayarans = pembayaranPaginate.all().map((item) => item.toJSON())

    // Helper function untuk parse JSON dengan error handling
    const safeJsonParse = (jsonString: string | null | undefined): any[] => {
      if (!jsonString) {
        return []
      }

      try {
        const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
        return Array.isArray(parsed) ? parsed : []
      } catch (error) {
        logger.error({ err: error, jsonString }, 'Gagal parse JSON nominalBayar')
        return []
      }
    }

    // Helper function untuk menghitung total dibayar
    const calculateTotalDibayar = (nominalBayarArray: any[]): number => {
      return nominalBayarArray.reduce((total: number, bayar: any) => {
        const nominal = parseFloat(bayar.nominal || '0')
        return total + (isNaN(nominal) ? 0 : nominal)
      }, 0)
    }

    // Process data untuk frontend
    const data = pembayarans.map((item: any) => {
      const nominalBayarArray = safeJsonParse(item.nominalBayar)

      const totalDibayar = calculateTotalDibayar(nominalBayarArray)
      const nominalPenetapan = parseFloat(item.nominalPenetapan || '0')
      const sisaPembayaran = nominalPenetapan - totalDibayar

      // Sort riwayat pembayaran dari terbaru
      const riwayatPembayaran = nominalBayarArray
        .filter((bayar) => bayar.tanggal && bayar.nominal) // Filter data yang valid
        .sort((a: any, b: any) => {
          const dateA = new Date(a.tanggal).getTime()
          const dateB = new Date(b.tanggal).getTime()
          return dateB - dateA // Descending (terbaru dulu)
        })

      return {
        ...item,
        userName: item?.user?.fullName,
        noTelepone: item?.noTelepone,
        totalDibayar,
        sisaPembayaran,
        lunas: sisaPembayaran <= 0,
        riwayatPembayaran,
        nominalPenetapan: isNaN(nominalPenetapan) ? 0 : nominalPenetapan,
      }
    })
    return inertia.render('Pembayaran/Index', {
      pembayaranPaginate: {
        currentPage: pembayaranPaginate.currentPage,
        lastPage: pembayaranPaginate.lastPage,
        total: pembayaranPaginate.total,
        perPage: pembayaranPaginate.perPage,
        firstPage: 1,
        nextPage:
          pembayaranPaginate.currentPage < pembayaranPaginate.lastPage
            ? pembayaranPaginate.currentPage + 1
            : null,
        previousPage:
          pembayaranPaginate.currentPage > 1 ? pembayaranPaginate.currentPage - 1 : null,
      },
      pembayarans: data,
      filter: { search, jenisPembayaran, tanggal },
      session: session.flashMessages.all(),
      searchQuery: search,
    })
  }

  public async indexSiswa({ inertia, session, auth }: HttpContext) {
    try {
      await auth.check()
      const user = auth.user!

      // Pastikan user adalah Siswa
      await user.load('dataSiswa')
      if (!user.dataSiswa) {
        return inertia.render('Error/Unauthorized', {
          message: 'Akses ditolak. Hanya untuk siswa.',
        })
      }

      // Ambil semua tagihan milik siswa ini
      const tagihanData = await DataPembayaran.query()
        .where('user_id', user.id)
        .orderBy('created_at', 'desc')

      const tagihan = tagihanData.map((item) => item.toJSON())

      // Process data untuk frontend
      const data = tagihan.map((item: any) => {
        const nominalBayarArray = this.safeJsonParse(item.nominalBayar)
        const totalDibayar = this.calculateTotalDibayar(nominalBayarArray)
        const nominalPenetapan = parseFloat(item.nominalPenetapan || '0')
        const sisaPembayaran = nominalPenetapan - totalDibayar

        // Riwayat pembayaran terbaru
        const riwayatPembayaran = nominalBayarArray
          .filter((bayar: any) => bayar.tanggal && bayar.nominal)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.tanggal).getTime()
            const dateB = new Date(b.tanggal).getTime()
            return dateB - dateA
          })

        // Pembayaran terakhir
        const pembayaranTerakhir = riwayatPembayaran.length > 0 ? riwayatPembayaran[0] : null

        return {
          id: item.id,
          jenisPembayaran: item.jenisPembayaran,
          nominalPenetapan: isNaN(nominalPenetapan) ? 0 : nominalPenetapan,
          totalDibayar,
          sisaPembayaran,
          lunas: sisaPembayaran <= 0,
          riwayatPembayaran,
          pembayaranTerakhir,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }
      })

      // Hitung statistik
      const totalTagihan = data.length
      const tagihanLunas = data.filter((item) => item.lunas).length
      const tagihanBelumLunas = data.filter((item) => !item.lunas).length
      const totalHutang = data.reduce(
        (total, item) => total + (item.lunas ? 0 : item.sisaPembayaran),
        0
      )

      return inertia.render('SiswaPage/Tagihan', {
        tagihan: data,
        statistik: {
          totalTagihan,
          tagihanLunas,
          tagihanBelumLunas,
          totalHutang,
        },
        session: session.flashMessages.all(),
        user: user.toJSON(),
      })
    } catch (error) {
      logger.error({ err: error }, 'Gagal memuat data tagihan siswa')
      return inertia.render('Error/InternalError', {
        message: 'Gagal memuat data tagihan',
      })
    }
  }

  /**
   * Helper function untuk parse JSON dengan error handling
   */
  private safeJsonParse(jsonString: string | null | undefined): any[] {
    if (!jsonString) {
      return []
    }

    try {
      const parsed = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      logger.error({ err: error, jsonString }, 'Gagal parse JSON nominalBayar')
      return []
    }
  }

  /**
   * Helper function untuk menghitung total dibayar
   */
  private calculateTotalDibayar(nominalBayarArray: any[]): number {
    return nominalBayarArray.reduce((total: number, bayar: any) => {
      const nominal = parseFloat(bayar.nominal || '0')
      return total + (isNaN(nominal) ? 0 : nominal)
    }, 0)
  }

  public async create({ inertia, session, request }: HttpContext) {
    const users = await User.query().select(['id', 'fullName']).where('role', 'siswa')
    const jenisPembayaranOptions = ['SPP', 'Uang Pangkal', 'Uang Daftar Ulang']

    // Cek jika ada parameter dari redirect (setelah konfirmasi)
    const userId = request.input('user_id')
    const jenisPembayaran = request.input('jenis_pembayaran')
    const nominalPenetapan = request.input('nominal_penetapan')

    let existingData = null
    if (userId && jenisPembayaran) {
      // Cek apakah sudah ada data pembayaran untuk siswa dan jenis ini
      existingData = await DataPembayaran.query()
        .where('user_id', userId)
        .where('jenis_pembayaran', jenisPembayaran)
        .first()
    }

    return inertia.render('Pembayaran/Create', {
      users,
      jenisPembayaranOptions,
      session: session.flashMessages.all(),
      existingData: existingData ? existingData.toJSON() : null,
      prefilledData: userId
        ? {
            userId,
            jenisPembayaran,
            nominalPenetapan,
          }
        : null,
    })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(pembayaranValidator)

      // Cek apakah sudah ada data untuk siswa dan jenis pembayaran ini
      const existingData = await DataPembayaran.query()
        .where('user_id', payload.userId)
        .where('jenis_pembayaran', payload.jenisPembayaran)
        .first()

      // Jika sudah ada dan action adalah 'update', update data yang existing
      const action = request.input('action')
      if (existingData && action === 'update') {
        existingData.useTransaction(trx)
        existingData.nominalPenetapan = payload.nominalPenetapan
        await existingData.save()

        await trx.commit()
        session.flash({
          status: 'success',
          message: 'Data penetapan pembayaran berhasil diperbarui.',
        })
        return response.redirect().toPath('/SuperAdmin/laporan-pembayaran')
      }

      // Jika sudah ada dan action bukan 'update', redirect dengan error
      if (existingData && action !== 'update') {
        await trx.rollback()
        session.flash({
          status: 'error',
          message: 'Siswa sudah memiliki penetapan pembayaran untuk jenis ini.',
        })
        return response.redirect().withQs().back()
      }

      // Jika tidak ada data existing, buat baru
      const pembayaranData = {
        ...payload,
        nominalBayar: JSON.stringify([]), // Initialize dengan array kosong
      }

      await DataPembayaran.create(pembayaranData, { client: trx })

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data pembayaran berhasil ditambahkan.',
      })
      return response.redirect().toPath('/SuperAdmin/laporan-pembayaran')
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data pembayaran baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data pembayaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async checkExisting({ request, response }: HttpContext) {
    try {
      const userId = request.input('user_id')
      const jenisPembayaran = request.input('jenis_pembayaran')

      if (!userId || !jenisPembayaran) {
        return response.json({
          success: false,
          error: 'User ID dan Jenis Pembayaran diperlukan',
        })
      }

      // Cek apakah sudah ada data pembayaran untuk siswa dan jenis ini
      const existingData = await DataPembayaran.query()
        .where('user_id', userId)
        .where('jenis_pembayaran', jenisPembayaran)
        .preload('user', (user) => user.select(['id', 'fullName']))
        .first()

      if (existingData) {
        const totalDibayar = existingData.getTotalDibayar()
        const sisaPembayaran = parseFloat(existingData.nominalPenetapan || '0') - totalDibayar

        return response.json({
          success: true,
          exists: true,
          data: {
            id: existingData.id,
            userId: existingData.userId,
            jenisPembayaran: existingData.jenisPembayaran,
            nominalPenetapan: existingData.nominalPenetapan,
            nominalBayar: existingData.nominalBayar,
            userName: existingData.user?.fullName,
            totalDibayar,
            sisaPembayaran,
            lunas: sisaPembayaran <= 0,
            riwayatPembayaran: existingData.getNominalBayarArray(),
            createdAt: existingData.createdAt,
          },
        })
      }

      return response.json({
        success: true,
        exists: false,
        data: null,
      })
    } catch (error: any) {
      logger.error({ err: error }, 'Error checking existing pembayaran')
      return response.status(500).json({
        success: false,
        error: 'Terjadi kesalahan server',
      })
    }
  }

  public async edit({ inertia, session, params }: HttpContext) {
    const pembayaran = await DataPembayaran.findOrFail(params.id)
    const users = await User.query().select(['id', 'fullName']).where('role', 'siswa')
    const jenisPembayaranOptions = ['SPP', 'Uang Pangkal', 'Uang Daftar Ulang']

    const pembayaranData = pembayaran.toJSON()
    pembayaranData.riwayatPembayaran = pembayaran.getNominalBayarArray()
    pembayaranData.totalDibayar = pembayaran.getTotalDibayar()
    pembayaranData.sisaPembayaran = pembayaran.getSisaPembayaran()

    return inertia.render('Pembayaran/Edit', {
      pembayaran: pembayaranData,
      users,
      session: session.flashMessages.all(),
      jenisPembayaranOptions,
    })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(pembayaranUpdateValidator)

      const pembayaran = await DataPembayaran.findOrFail(id)
      pembayaran.useTransaction(trx)
      pembayaran.merge(payload as any)
      await pembayaran.save()

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data pembayaran berhasil diperbarui.',
      })
      return response.redirect().toPath('/SuperAdmin/laporan-pembayaran')
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data pembayaran ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data pembayaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async tambahPembayaran({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    const formatRupiah = (value: string) => {
      const number = value.replace(/[^,\d]/g, '')
      const split = number.split(',')
      const remainder = split[0].length % 3
      let rupiah = split[0].substr(0, remainder)
      const thousand = split[0].substr(remainder).match(/\d{3}/gi)

      if (thousand) {
        const separator = remainder ? '.' : ''
        rupiah += separator + thousand.join('.')
      }

      rupiah = split[1] ? rupiah + ',' + split[1] : rupiah
      return 'Rp ' + rupiah
    }

    try {
      const payload = await request.validateUsing(tambahPembayaranValidator)

      const pembayaran = await DataPembayaran.findOrFail(id)
      pembayaran.useTransaction(trx)

      // Validasi nominal
      const nominalBaru = parseFloat(payload.nominal)
      if (isNaN(nominalBaru) || nominalBaru <= 0) {
        throw new Error('Nominal harus berupa angka yang valid dan lebih dari 0')
      }

      // Hitung total yang sudah dibayar
      const currentBayar = pembayaran.getNominalBayarArray()
      const totalDibayar = currentBayar.reduce((total, item) => {
        return total + parseFloat(item.nominal || '0')
      }, 0)

      const nominalPenetapan = parseFloat(pembayaran.nominalPenetapan || '0')
      const sisaPembayaran = nominalPenetapan - totalDibayar

      // Validasi tidak melebihi sisa pembayaran
      if (nominalBaru > sisaPembayaran) {
        throw new Error(
          `Nominal pembayaran (${formatRupiah(String(nominalBaru))}) melebihi sisa pembayaran (${formatRupiah(String(sisaPembayaran))})`
        )
      }

      // Validasi tidak melebihi nominal penetapan
      if (totalDibayar + nominalBaru > nominalPenetapan) {
        throw new Error(
          `Total pembayaran akan melebihi nominal penetapan. ` +
            `Sudah dibayar: ${formatRupiah(String(totalDibayar))}, ` +
            `Penetapan: ${formatRupiah(String(nominalPenetapan))}, ` +
            `Maksimal bisa bayar: ${formatRupiah(String(sisaPembayaran))}`
        )
      }

      // Tambahkan pembayaran baru ke riwayat
      currentBayar.push({
        nominal: payload.nominal,
        tanggal: payload.tanggal,
      })

      pembayaran.nominalBayar = JSON.stringify(currentBayar)
      await pembayaran.save()

      await trx.commit()

      // Cek apakah sudah lunas setelah pembayaran ini
      const totalSetelahBayar = totalDibayar + nominalBaru
      const sisaSetelahBayar = nominalPenetapan - totalSetelahBayar

      let message = `Pembayaran sebesar ${formatRupiah(String(nominalBaru))} berhasil ditambahkan.`

      if (sisaSetelahBayar <= 0) {
        message += ' STATUS: LUNAS!'
      } else {
        message += ` Sisa pembayaran: ${formatRupiah(String(sisaSetelahBayar))}`
      }

      session.flash({
        status: 'success',
        message: message,
      })
      return response.redirect().withQs().back()
    } catch (error: any) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal menambah pembayaran ID: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal menambah pembayaran',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const pembayaran = await DataPembayaran.findOrFail(id)
      await pembayaran.delete()

      session.flash({
        status: 'success',
        message: 'Data pembayaran berhasil dihapus.',
      })
    } catch (error: any) {
      logger.error({ err: error }, `Gagal hapus data pembayaran`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data pembayaran',
        error: error,
      })
    }
    return response.redirect().withQs().back()
  }

  public async cetakInvoice({ params, response }: HttpContext) {
    try {
      const pembayaran = await DataPembayaran.findOrFail(params.id)
      await pembayaran.load('user', (query) => {
        query.select(['id', 'fullName'])
      })

      const dataSiswa = await DataSiswa.query()
        .where('user_id', pembayaran.userId)
        .select(['nisn'])
        .first()

      const totalDibayar = pembayaran.getTotalDibayar()
      const sisaPembayaran = parseFloat(pembayaran.nominalPenetapan || '0') - totalDibayar
      const riwayatPembayaran = pembayaran
        .getNominalBayarArray()
        .sort((a: any, b: any) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime())

      // Data untuk invoice
      const invoiceData = {
        id: pembayaran.id,
        siswa: pembayaran.user?.fullName,
        nisn: dataSiswa?.nisn,
        jenisPembayaran: pembayaran.jenisPembayaran,
        nominalPenetapan: pembayaran.nominalPenetapan,
        totalDibayar,
        sisaPembayaran,
        lunas: sisaPembayaran <= 0,
        riwayatPembayaran,
        tanggalCetak: DateTime.now().toFormat('dd/MM/yyyy HH:mm'),
        nomorInvoice: `INV-${DateTime.now().toFormat('yyyyMMdd')}-${pembayaran.id.substring(0, 8).toUpperCase()}`,
      }

      return response.json({
        success: true,
        data: invoiceData,
      })
    } catch (error: any) {
      logger.error({ err: error }, 'Gagal generate invoice')
      return response.status(500).json({
        success: false,
        error: 'Gagal generate invoice',
      })
    }
  }

  public async partisipasiUjian({ inertia, response, request, session, auth }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const search = request.input('search', '')
      const jenisPembayaran = request.input('jenisPembayaran', '')

      await auth.check()

      // Query untuk mendapatkan siswa yang belum lunas
      const query = DataPembayaran.query()
        .whereHas('user', (userQuery) => {
          userQuery.where('role', 'siswa')
          if (search) {
            userQuery.where('fullName', 'LIKE', `%${search}%`)
          }
        })
        .preload('user', (user) => {
          user.preload('dataSiswa')
          user.select(['id', 'fullName'])
        })

      // Filter berdasarkan jenis pembayaran
      if (jenisPembayaran) {
        query.where('jenis_pembayaran', 'LIKE', `%${jenisPembayaran}%`)
      }

      const semuaPembayaran = await query.exec()

      // Filter hanya yang belum lunas
      const pembayaranBelumLunas = semuaPembayaran.filter((pembayaran) => {
        const totalDibayar = pembayaran.getTotalDibayar()
        const nominalPenetapan = parseFloat(pembayaran.nominalPenetapan || '0')
        return totalDibayar < nominalPenetapan
      })

      // Pagination manual
      const perPage = 15
      const startIndex = (page - 1) * perPage
      const endIndex = startIndex + perPage
      const dataPaginated = pembayaranBelumLunas.slice(startIndex, endIndex)

      // Process data untuk frontend
      const data = dataPaginated.map((pembayaran) => {
        const totalDibayar = pembayaran.getTotalDibayar()
        const nominalPenetapan = parseFloat(pembayaran.nominalPenetapan || '0')
        const sisaPembayaran = nominalPenetapan - totalDibayar

        return {
          id: pembayaran.id,
          userId: pembayaran.userId,
          userName: pembayaran.user?.fullName,
          nisn: pembayaran.user?.dataSiswa?.nisn,
          jenisPembayaran: pembayaran.jenisPembayaran,
          nominalPenetapan,
          totalDibayar,
          sisaPembayaran,
          partisipasiUjian: pembayaran.partisipasiUjian,
          createdAt: pembayaran.createdAt,
        }
      })

      const totalPages = Math.ceil(pembayaranBelumLunas.length / perPage)

      return inertia.render('Pembayaran/PartisipasiUjian', {
        pembayarans: data,
        pagination: {
          currentPage: parseInt(page),
          lastPage: totalPages,
          total: pembayaranBelumLunas.length,
          perPage: perPage,
        },
        filters: {
          search,
          jenisPembayaran,
        },
        session: session.flashMessages.all(),
      })
    } catch (error) {
      logger.error({ err: error }, 'Gagal memuat data partisipasi ujian')
      session.flash({
        status: 'error',
        message: 'Gagal memuat data partisipasi ujian',
      })
      return response.redirect().withQs().back()
    }
  }

  public async updatePartisipasiUjian({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const { pembayaranId, partisipasiUjian } = request.only(['pembayaranId', 'partisipasiUjian'])

      const pembayaran = await DataPembayaran.findOrFail(pembayaranId)
      pembayaran.useTransaction(trx)

      // Update status partisipasi ujian
      pembayaran.partisipasiUjian = partisipasiUjian === 'true' || partisipasiUjian === true

      await pembayaran.save()
      await trx.commit()

      session.flash({
        status: 'success',
        message: `Status partisipasi ujian berhasil diupdate menjadi ${pembayaran.partisipasiUjian ? 'Diizinkan' : 'Tidak Diizinkan'}`,
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal update partisipasi ujian')
      session.flash({
        status: 'error',
        message: 'Gagal update partisipasi ujian',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }

  public async bulkUpdatePartisipasiUjian({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const { action, selectedIds } = request.only(['action', 'selectedIds'])

      if (!selectedIds || !Array.isArray(selectedIds) || selectedIds.length === 0) {
        session.flash({
          status: 'error',
          message: 'Tidak ada data yang dipilih',
        })
        return response.redirect().withQs().back()
      }

      const status = action === 'allow'

      // Update semua data yang dipilih
      await DataPembayaran.query()
        .useTransaction(trx)
        .whereIn('id', selectedIds)
        .update({ partisipasiUjian: status })

      await trx.commit()

      session.flash({
        status: 'success',
        message: `Berhasil mengupdate ${selectedIds.length} data partisipasi ujian`,
      })
      return response.redirect().withQs().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal bulk update partisipasi ujian')
      session.flash({
        status: 'error',
        message: 'Gagal update partisipasi ujian',
        error: error,
      })
      return response.redirect().withQs().back()
    }
  }
}
