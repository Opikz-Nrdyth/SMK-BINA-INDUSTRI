import Blog from '#models/blog'
import DataAds from '#models/data_ads'
import DataAktivita from '#models/data_aktivitas'
import DataMapel from '#models/data_mapel'
import DataTahunAjaran from '#models/data_tahun_ajaran'
import DataWebsite from '#models/data_website'
import User from '#models/user'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'
import fs from 'fs'
import path from 'path'

export default class LandingPageController {
  public async index({ inertia, session }: HttpContext) {
    const settings = await DataWebsite.getAllSettings()

    const kepalaSekolah = await DataTahunAjaran.query()
      .preload('user')
      .orderBy('created_at', 'desc')
      .first()

      if(!kepalaSekolah){
        session.flash({
        status: 'error',
        message: 'Tambahkan Dahulu Kepala Sekolah',
      })
      }
    return inertia.render('ManajemenWebsite/Index', { settings, kepalaSekolah })
  }

  public async update({ request, response }: HttpContext) {
    const data = request.all()

    const base64String = data.school_logo
    if (base64String && base64String.startsWith('data:image')) {
      const matches = base64String.match(/^data:(image\/\w+);base64,(.+)$/)
      if (!matches) return console.log('Invalid base64 image data')
      const ext = matches[1].split('/')[1] 
      const buffer = Buffer.from(matches[2], 'base64')
      const iconDir = path.join(app.publicPath(), 'icons')
      const filePath = path.join(iconDir, `icon-192x192.${ext}`)
      if (!fs.existsSync(iconDir)) {
        fs.mkdirSync(iconDir, { recursive: true })
      }
      fs.writeFileSync(filePath, buffer)
      
    }
    
    try {
      for (const [key, value] of Object.entries(data)) {
        let storedValue = value

        // 🔒 Jika array atau object, ubah ke JSON string
        if (typeof value === 'object' && value !== null) {
          storedValue = JSON.stringify(value)
        }

        await DataWebsite.updateSetting(key, storedValue)
      }

      return response.redirect().back()
    } catch (error) {
      console.error('Error update settings:', error)
      return response.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menyimpan pengaturan',
        error: error,
      })
    }
  }

  public async uploadFasilitas({ request, response }: HttpContext) {
    const file = request.file('file', {
      size: '2mb',
      extnames: ['jpg', 'png', 'jpeg', 'webp'],
    })

    if (!file) {
      return response.badRequest({ success: false, message: 'File tidak ditemukan' })
    }

    try {
      const fileName = `${cuid()}.${file.extname}`
      await file.move(app.makePath('storage/fasilitas'), { name: fileName })

      return response.json({
        success: true,
        url: `/storage/fasilitas/${fileName}`,
      })
    } catch (error) {
      console.error(error)
      return response.status(500).json({
        success: false,
        message: 'Gagal upload file',
        error: error.message,
      })
    }
  }

  public async Dashboard({ inertia }: HttpContext) {
    let dataWebsite = await DataWebsite.getAllSettings()
    const now = DateTime.now()
    const ads = await DataAds.query()
      .where('aktif', true)
      .where('tanggal_mulai', '<=', now.toJSDate())
      .andWhere('tanggal_selesai', '>=', now.toJSDate())

    const kepalaSekolah = await DataTahunAjaran.query()
      .preload('user')
      .orderBy('created_at', 'desc')
      .first()

    const aktivitas = await DataAktivita.query().where("jenis", "prestasi")
    const news = await Blog.query()
    const guruList = await User.query().where('role', 'Guru').preload('dataGuru')
    const semuaMapel = await DataMapel.all()
    const guruDenganMapel = guruList.map((guru) => {
      const nipGuru = guru.dataGuru?.nip

      // cari mapel yang guruAmpu-nya berisi NIP ini
      const mapelAmpu = semuaMapel.filter(
        (mapel) => mapel.getGuruAmpuArray().length > 0 && mapel.getGuruAmpuArray().includes(nipGuru)
      )

      const mapelPertama = mapelAmpu[0]
      return {
        ...guru.serialize(),
        jabatan: mapelPertama ? `Guru ${mapelPertama.namaMataPelajaran}` : 'Guru',
        role: 'Guru',
        fileFoto: guru.dataGuru.fileFoto,
      }
    })

    const stafList = await User.query().where('role', 'Staf').preload('dataStaf')

    // format staf
    const stafDenganJabatan = stafList.map((staf) => ({
      id: staf.id,
      fullName: staf.fullName,
      jabatan: `Staf ${staf.dataStaf?.departemen}` || null,
      fileFoto: staf.dataStaf.fileFoto,
      role: 'Staf',
    }))

    const semuaPegawai = [...guruDenganMapel, ...stafDenganJabatan]
    function acakArray<T>(arr: T[]): T[] {
      const array = [...arr]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    dataWebsite = {
      ...dataWebsite,
      headmaster_name: kepalaSekolah?.user.fullName,
      aktivitas,
      news,
      pegawai: acakArray(semuaPegawai).slice(0, 8),
    }

    return inertia.render('Home', { dataWebsite, ads })
  }

  public async Profile({ inertia }: HttpContext) {
    let dataWebsite = await DataWebsite.getAllSettings()

    return inertia.render('Sejarah', { dataWebsite })
  }

  public async GuruStaf({ request, inertia }: HttpContext) {
    const search = request.input('search', '').trim().toLowerCase()
    const filter = request.input('filter', '').trim().toLowerCase()

    const [guruList, stafList, semuaMapel] = await Promise.all([
      User.query().where('role', 'Guru').preload('dataGuru'),
      User.query().where('role', 'Staf').preload('dataStaf'),
      DataMapel.all(),
    ])

    // === Helper Function ===
    function acakArray<T>(arr: T[]): T[] {
      const array = [...arr]
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
      }
      return array
    }

    function capitalize(str: string): string {
      return str.charAt(0).toUpperCase() + str.slice(1)
    }

    // ======== GURU =========
    const guruDenganMapel = guruList
      .filter((guru) => {
        const nipGuru = guru.dataGuru?.nip
        const mapelAmpu = semuaMapel.filter((mapel) => mapel.getGuruAmpuArray().includes(nipGuru))
        return mapelAmpu.length > 0
      })
      .map((guru) => {
        const nipGuru = guru.dataGuru?.nip
        const mapelAmpu = semuaMapel.filter((mapel) => mapel.getGuruAmpuArray().includes(nipGuru))
        const mapelPertama = mapelAmpu[0]

        return {
          id: guru.id,
          fullName: guru.fullName,
          role: 'Guru',
          fileFoto: guru.dataGuru.fileFoto,
          jabatan: mapelPertama ? `Guru ${mapelPertama.namaMataPelajaran}` : 'Guru',
          mapelPertama: mapelPertama ? mapelPertama.namaMataPelajaran : null,
          semuaMapelAmpu: mapelAmpu.map((m) => m.namaMataPelajaran),
        }
      })

    // ======== STAF =========
    const stafDenganJabatan = stafList.map((staf) => ({
      id: staf.id,
      fullName: staf.fullName,
      role: 'Staf',
      fileFoto: staf.dataStaf.fileFoto,
      jabatan: staf.dataStaf?.departemen ? `Staf ${staf.dataStaf?.departemen}` : 'Staf',
    }))

    // ======== GABUNG =========
    let semuaPegawai = [...guruDenganMapel, ...stafDenganJabatan]

    // ======== FILTER / SEARCH =========
    if (search || filter) {
      semuaPegawai = semuaPegawai.filter((p) => {
        const nama = (p.fullName ?? '').toLowerCase()
        const jabatan = p.jabatan.toLowerCase()

        const cocokSearch = search ? nama.includes(search) : true
        const cocokFilter = filter ? jabatan.includes(filter) : true

        return cocokSearch && cocokFilter
      })
    } else {
      semuaPegawai = acakArray(semuaPegawai).slice(0, 50)
    }

    // batasi hasil maksimum 50
    semuaPegawai = semuaPegawai.slice(0, 50)

    // ======== BUAT SEMUA FILTER (MAPEL + DEPARTEMEN) =========
    const semuaMapelUnik = Array.from(
      new Set(
        semuaMapel
          .filter((m) => Array.isArray(m.getGuruAmpuArray()) && m.getGuruAmpuArray().length > 0)
          .map((m) => m.namaMataPelajaran?.trim())
          .filter((n) => !!n) // buang null/undefined/empty
      )
    )

    // Daftar departemen statis (karena tidak ada tabelnya)
    const semuaDepartemen = ['Staf Manajemen', 'Staf Keuangan', 'Staf Multimedia']

    // Ambil 10 mapel acak
    let mapelAcak = acakArray(semuaMapelUnik).slice(0, 10)

    // Jika sedang filter mapel tertentu, pastikan tetap muncul
    if (
      filter &&
      semuaMapelUnik.includes(capitalize(filter)) &&
      !mapelAcak.includes(capitalize(filter))
    ) {
      mapelAcak.unshift(capitalize(filter)) // tambahkan di awal
    }

    // Gabungkan mapel dan departemen sebagai filter props
    const semuaFilter = [...semuaDepartemen, ...mapelAcak]

    // ======== RENDER =========
    return inertia.render('GuruStaf', {
      pegawai: semuaPegawai,
      semuaFilter,
      search,
      filter,
    })
  }

  public async Blog({ inertia, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = 30

    const search = request.input('search', '').trim().toLowerCase()
    const filter = request.input('filter', '').trim().toLowerCase()

    const newsList = Blog.query().preload('penulis')

    if (search) {
      newsList.where('judul', 'LIKE', `%${search}%`)
    }

    if (filter && filter != 'all') {
      newsList.where('kategori', filter)
    }

    const news = await newsList.orderBy('created_at', 'desc').paginate(page, limit)

    // tambahkan serialize agar pagination info ikut
    news.baseUrl('/blog')

    return inertia.render('BlogList', { news, search, filter })
  }

  public async showBlog({ params, inertia, response }: HttpContext) {
    try {
      const slug = params.slug

      const post = await Blog.query().where('slug', slug).preload('penulis').firstOrFail()

      post.dilihat = (post.dilihat ?? 0) + 1
      await post.save()

      // Ambil artikel lain dalam kategori yang sama (tidak termasuk dirinya)
      const relatedPosts = await Blog.query()
        .where('kategori', String(post.kategori))
        .whereNot('id', post.id)
        .where('status', 'published')
        .orderByRaw('RAND()')
        .limit(3)

      // Jika tidak cukup related posts, isi dengan random lain
      if (relatedPosts.length < 3) {
        const filler = await Blog.query()
          .whereNot('id', post.id)
          .where('status', 'published')
          .orderByRaw('RAND()')
          .limit(3 - relatedPosts.length)
        relatedPosts.push(...filler)
      }

      // Format data sesuai props frontend
      const postData = {
        id: post.id,
        title: post.judul,
        slug: post.slug,
        content: post.konten,
        summary: post.ringkasan,
        thumbnail: `/storage/blogs/${post.thumbnail}`,
        status: post.status,
        category: post.kategori,
        tags: post.tags ? post.tags.split(',').map((t) => t.trim()) : [],
        views: post.dilihat,
        author: post.penulis?.fullName ?? 'Anonim',
        published_at: post.publishedAt ?? post.createdAt,
      }

      const relatedData = relatedPosts.map((r) => ({
        id: r.id,
        title: r.judul,
        slug: r.slug,
        summary: r.ringkasan,
        thumbnail: `/storage/blogs/${r.thumbnail}`,
        category: r.kategori,
        views: r.dilihat ?? 0,
        published_at: r.publishedAt,
      }))

      return inertia.render('BlogContent', {
        post: postData,
        relatedPosts: relatedData,
      })
    } catch (error) {
      console.error(error)
      return response.redirect('/blog')
    }
  }

  public async activity({ request, inertia }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')
    const filter = request.input('filter', 'all')
    const perPage = 9

    // Query dasar
    let query = DataAktivita.query()
      .preload('pembuat')
      .where('status', 'published')
      .orderBy('tanggalPelaksanaan', 'desc')

    // Filter berdasarkan jenis
    if (filter !== 'all') {
      query = query.where('jenis', filter)
    }

    // Search berdasarkan nama, deskripsi, atau lokasi
    if (search) {
      query = query.where((query) => {
        query
          .where('nama', 'ILIKE', `%${search}%`)
          .orWhere('deskripsi', 'ILIKE', `%${search}%`)
          .orWhere('lokasi', 'ILIKE', `%${search}%`)
      })
    }

    // Pagination
    const activities = await query.paginate(page, perPage)

    return inertia.render('Activity', {
      activities: activities.all(),
      meta: activities.getMeta(),
      search,
      filter,
    })
  }

  public async showActivity({ params, inertia, response }: HttpContext) {
    try {
      const listActivity = await DataAktivita.query()
        .preload('pembuat')
        .where('id', params.id)
        .where('status', 'published')
        .firstOrFail()

      const activity = {
        ...listActivity.serialize(),
        dokumentasi: `/storage/aktivitas/${listActivity.dokumentasi}`,
      }

      return inertia.render('ActivityDetails', {
        activity: activity,
      })
    } catch (error) {
      return response.redirect().back()
    }
  }
}
