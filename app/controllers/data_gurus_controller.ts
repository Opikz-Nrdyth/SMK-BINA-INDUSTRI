import DataGuru from '#models/data_guru'
import User from '#models/user'
import { userGuruValidator } from '#validators/data_guru'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import db from '@adonisjs/lucid/services/db'
import fs from 'fs/promises'
import ExcelJS from 'exceljs'
import { join } from 'path'
import app from '@adonisjs/core/services/app'

export default class DataGurusController {
  public async index({ request, inertia, session }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const selectedMapel = request.input('mapel', '')

    const baseQuery = DataGuru.query().preload('user').preload('mapel')

    // 🔍 Filter berdasarkan search
    if (search) {
      baseQuery.where((builder) => {
        builder
          .where('nip', 'LIKE', `%${search}%`)
          .orWhereHas('user', (userQuery) => {
            userQuery
              .where('full_name', 'LIKE', `%${search}%`)
              .orWhere('email', 'LIKE', `%${search}%`)
          })
          .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
      })
    }

    // 🎯 Filter berdasarkan mapel yang dipilih
    if (selectedMapel) {
      baseQuery.whereExists((subquery) => {
        subquery
          .from('data_mapels')
          .whereRaw('JSON_CONTAINS(data_mapels.guru_ampu, JSON_QUOTE(data_gurus.nip))')
          .andWhere('data_mapels.nama_mata_pelajaran', 'LIKE', `%${selectedMapel}%`)
      })
    }

    // Pagination
    const guruPaginate = await baseQuery.orderBy('createdAt', 'desc').paginate(page, 15)

    // Ambil data mapel unik untuk daftar kartu
    const mapelList = await db
      .from('data_mapels')
      .select('nama_mata_pelajaran')
      .count('* as jumlahGuru')
      .groupBy('nama_mata_pelajaran')

    // 🧩 Serialize guru
    const dataGuru = await Promise.all(
      guruPaginate.all().map(async (item) => {
        const mapel = await item.mapelAmpuGuru()

        return {
          ...item.serialize(),
          mapel,
        }
      })
    )

    return inertia.render('Guru/Index', {
      guruPaginate: {
        currentPage: guruPaginate.currentPage,
        lastPage: guruPaginate.lastPage,
        total: guruPaginate.total,
        perPage: guruPaginate.perPage,
      },
      gurus: dataGuru,
      mapelList,
      selectedMapel,
      searchQuery: search,
      session: session.flashMessages.all(),
    })
  }

  public async create({ inertia, session }: HttpContext) {
    return inertia.render('Guru/Create', { session: session.flashMessages.all() })
  }

  public async store({ request, response, session }: HttpContext) {
    const trx = await db.transaction()

    try {
      const payload = await request.validateUsing(userGuruValidator)

      const fileFoto = request.file('guru.fileFoto')
        ? await this.uploadFile(request.file('guru.fileFoto'), String(payload.guru.nip))
        : null

      const user = await User.create({ ...payload.user, role: 'Guru' }, { client: trx })
      await DataGuru.create(
        { ...(payload.guru as any), userId: user.id, fileFoto: fileFoto },
        { client: trx }
      )

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data guru berhasil ditambahkan.',
      })
      return response.redirect().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, 'Gagal menyimpan data guru baru')
      session.flash({
        status: 'error',
        message: 'Gagal menyimpan data guru',
        error: error,
      })
      return response.redirect().back()
    }
  }

  public async edit({ inertia, params, session }: HttpContext) {
    const guru = await DataGuru.query().where('nip', params.id).preload('user').firstOrFail()

    return inertia.render('Guru/Edit', { guru, session: session.flashMessages.all() })
  }

  public async update({ request, response, session, params }: HttpContext) {
    const trx = await db.transaction()
    const id = params.id

    try {
      const payload = await request.validateUsing(userGuruValidator)

      const guru = await DataGuru.query().where('nip', id).firstOrFail()

      const user = await User.findOrFail(guru?.userId, { client: trx })
      const { password } = payload.user

      const fileFoto = request.file('guru.fileFoto')
        ? await this.uploadFile(request.file('guru.fileFoto'), guru.nip)
        : guru.fileFoto

      user.merge(payload.user)
      if (password) {
        user.password = password
      }
      await user.save()

      guru?.useTransaction(trx)
      guru?.merge({ ...payload.guru, fileFoto: fileFoto } as any)
      await guru?.save()

      await trx.commit()
      session.flash({
        status: 'success',
        message: 'Data guru berhasil diperbarui.',
      })
      return response.redirect().back()
    } catch (error) {
      await trx.rollback()
      logger.error({ err: error }, `Gagal update data guru NIP: ${id}`)
      session.flash({
        status: 'error',
        message: 'Gagal memperbarui data guru',
        error: error,
      })
      return response.redirect().back()
    }
  }

  public async destroy({ response, session, params }: HttpContext) {
    try {
      const { id } = params
      const guru = await DataGuru.query().where('nip', id).firstOrFail()
      const user = await User.query().where('id', guru.userId).firstOrFail()
      await this.deleteFile(guru.fileFoto)
      await guru.delete()
      await user.delete()
      session.flash({
        status: 'success',
        message: 'Data guru berhasil dihapus.',
      })
    } catch (error) {
      logger.error({ err: error }, `Gagal hapus data guru`)
      session.flash({
        status: 'error',
        message: 'Gagal menghapus data guru',
        error: error,
      })
    }
    return response.redirect().back()
  }

  public async exportExcel({ response }: HttpContext) {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Data Guru')

    sheet.columns = [
      { header: 'NIP', key: 'nip', width: 20 },
      { header: 'Nama Lengkap', key: 'namaLengkap', width: 25 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Nomor HP', key: 'noHp', width: 20 },
      { header: 'Jenis Kelamin', key: 'jenisKelamin', width: 15 },
      { header: 'Tempat Lahir', key: 'tempatLahir', width: 20 },
      { header: 'Tanggal Lahir', key: 'tanggalLahir', width: 20 },
      { header: 'Alamat', key: 'alamat', width: 40 },
      { header: 'Agama', key: 'agama', width: 20 },
      { header: 'Gelar Depan', key: 'gelarDepan', width: 20 },
      { header: 'Gelar Belakang', key: 'gelarBelakang', width: 20 },
    ]

    const gurus = await DataGuru.query().preload('user')

    gurus.forEach((guru) => {
      sheet.addRow({
        nip: guru.nip,
        namaLengkap: guru.user.fullName,
        email: guru.user.email,
        noHp: guru.noTelepon,
        jenisKelamin: guru.jenisKelamin,
        tempatLahir: guru.tempatLahir,
        tanggalLahir: guru.tanggalLahir,
        alamat: guru.alamat,
        agama: guru.agama,
        gelarDepan: guru.gelarDepan,
        gelarBelakang: guru.gelarBelakang,
      })
    })

    sheet.getRow(1).font = { bold: true }
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' },
    }

    const buffer = await workbook.xlsx.writeBuffer()
    response.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    response.header('Content-Disposition', 'attachment; filename="data_guru.xlsx"')
    return response.send(buffer)
  }

  public async importExcel({ request, response, session }: HttpContext) {
    const file = request.file('excel_file')

    if (!file) {
      session.flash({
        status: 'error',
        message: 'Data Excel wajib diunggah.',
      })
      console.log('❌ File Excel wajib diunggah')
      return response.redirect().back()
    }

    const buffer = await fs.readFile(file.tmpPath!)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const sheet = workbook.getWorksheet(1)

    let berhasil = 0
    let gagal = 0

    for (const row of sheet?.getRows(2, sheet.rowCount - 1) || []) {
      const [
        nip,
        namaLengkap,
        email,
        noHp,
        jenisKelamin,
        tempatLahir,
        tanggalLahir,
        alamat,
        agama,
        gelarDepan,
        gelarBelakang,
      ] = (row.values as any[])?.slice(1) || []

      // Skip baris kosong
      if (!namaLengkap) continue

      try {
        // Cek apakah user sudah ada berdasarkan email atau nip
        const existingUser = await User.query()
          .where('email', String(email ?? '').toLowerCase())
          .orWhereHas('dataStaf', (stafQuery) => {
            stafQuery.where('nip', String(nip ?? ''))
          })
          .first()

        if (existingUser) {
          console.log(`⚠️ User dengan email ${email} atau NIP ${nip} sudah ada.`)
          gagal++
          continue
        }

        // Buat user baru
        const user = await User.create({
          fullName: String(namaLengkap ?? ''),
          email: String(email ?? '').toLowerCase(),
          password: '12345678',
        })

        // Buat Guru baru
        await DataGuru.create({
          userId: user.id,
          noTelepon: String(noHp ?? ''),
          nip: String(nip ?? ''),
          agama: String(agama ?? ''),
          gelarDepan: String(gelarDepan ?? ''),
          gelarBelakang: String(gelarBelakang ?? ''),
          tempatLahir: String(tempatLahir ?? ''),
          jenisKelamin: String(jenisKelamin ?? '') as 'Laki-laki' | 'Perempuan',
          tanggalLahir: tanggalLahir,
          alamat: String(alamat ?? ''),
        })

        berhasil++
      } catch (err) {
        gagal++
      }
    }

    session.flash({
      status: 'success',
      message: `Import selesai. Berhasil: ${berhasil}, Gagal: ${gagal}`,
    })

    return response.redirect().back()
  }

  private async uploadFile(file: any, nip: string): Promise<string> {
    const fileName = `${nip}_${Date.now()}.${file.extname}`
    const uploadPath = `storage/guru/`

    const dest = join(app.makePath(uploadPath))
    await file.move(dest, { name: `${fileName}` })

    return `${uploadPath}/${fileName}`
  }

  private async deleteFile(filePath: string | null) {
    if (!filePath) return

    try {
      const fullPath = join(app.makePath(filePath))
      await fs.unlink(fullPath)
      logger.info(`File berhasil dihapus: ${filePath}`)
    } catch (error) {
      // Jika file tidak ditemukan, tidak perlu throw error
      if (error.code !== 'ENOENT') {
        logger.warn(`Gagal menghapus file ${filePath}: ${error.message}`)
      }
    }
  }
}
