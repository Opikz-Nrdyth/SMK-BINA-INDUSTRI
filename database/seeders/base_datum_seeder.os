// database/seeders/database_seeder.ts
import Blog from '#models/blog'
import DataAbsensi from '#models/data_absensi'
import DataAbsensiWaliKelas from '#models/data_absensi_wali_kelas'
import DataAktivita from '#models/data_aktivitas'
import DataGuru from '#models/data_guru'
import DataInformasi from '#models/data_informasi'
import DataJurusan from '#models/data_jurusan'
import DataKelas from '#models/data_kelas'
import DataMapel from '#models/data_mapel'
import DataSiswa from '#models/data_siswa'
import DataStaf from '#models/data_staf'
import DataTahunAjaran from '#models/data_tahun_ajaran'
import DataWali from '#models/data_wali'
import User from '#models/user'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { randomUUID } from 'crypto'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  // Data statis yang sudah diacak
  private namaDepan = [
    'Ahmad',
    'Budi',
    'Citra',
    'Dewi',
    'Eko',
    'Fajar',
    'Gita',
    'Hadi',
    'Indra',
    'Joko',
    'Kartika',
    'Lia',
    'Maya',
    'Nina',
    'Oki',
    'Putri',
    'Rina',
    'Sari',
    'Tono',
    'Umi',
  ]
  private namaBelakang = [
    'Santoso',
    'Wijaya',
    'Kusuma',
    'Pratama',
    'Siregar',
    'Halim',
    'Nugroho',
    'Saputra',
    'Hidayat',
    'Setiawan',
    'Rahayu',
    'Purnama',
    'Lesmana',
    'Kurniawan',
    'Suryadi',
    'Wibowo',
    'Gunawan',
    'Fernando',
    'Simanjuntak',
    'Pangestu',
  ]
  private kota = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Medan',
    'Semarang',
    'Yogyakarta',
    'Malang',
    'Denpasar',
    'Makassar',
    'Palembang',
  ]
  private agama = ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha']
  private pekerjaan = [
    'Pegawai Swasta',
    'Wiraswasta',
    'PNS',
    'Guru',
    'Dokter',
    'Perawat',
    'Pengusaha',
    'Ibu Rumah Tangga',
    'Buruh',
    'Petani',
  ]
  private mapelList = [
    'Matematika',
    'Bahasa Indonesia',
    'Bahasa Inggris',
    'Fisika',
    'Kimia',
    'Biologi',
    'Sejarah',
    'Geografi',
    'Ekonomi',
    'Sosiologi',
  ]
  private kelasList = [
    'X IPA 1',
    'X IPA 2',
    'XI IPA 1',
    'XI IPA 2',
    'XII IPA 1',
    'X IPS 1',
    'XI IPS 1',
    'XII IPS 1',
  ]
  private jurusanList = ['Ilmu Pengetahuan Alam', 'Ilmu Pengetahuan Sosial', 'Bahasa dan Budaya']

  // Fungsi untuk mengacak array
  private acakArray<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5)
  }

  // Fungsi untuk mendapatkan elemen random dari array
  private acak<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
  }

  // Fungsi untuk generate nama lengkap
  private generateNama(): string {
    return `${this.acak(this.namaDepan)} ${this.acak(this.namaBelakang)}`
  }

  // Fungsi untuk generate NIP/NISN
  private generateNip(): string {
    return `19${Math.floor(Math.random() * 40) + 60}${Math.random().toString().substr(2, 12)}`
  }

  private generateNisn(): string {
    return `00${Math.random().toString().substr(2, 9)}`
  }

  public async run() {
    console.log('🌱 Starting database seeding...')

    // 1. Create SuperAdmin first
    console.log('Creating SuperAdmin...')
    const superAdmin = await User.create({
      fullName: 'Super Administrator',
      email: 'admin@gmail.com',
      password: 'Admin123',
      role: 'SuperAdmin',
    })

    // 2. Create Users (20 Guru, 20 Staf, 20 Siswa)
    console.log('Creating users...')
    const users = {
      guru: [],
      staf: [],
      siswa: [],
    }

    // Guru users
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        fullName: `${this.generateNama()}`,
        email: `guru${i}@sekolah.sch.id`,
        password: 'password123',
        role: 'Guru',
      })
      users.guru.push(user)
    }

    // Staf users
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        fullName: `${this.generateNama()}`,
        email: `staf${i}@sekolah.sch.id`,
        password: 'password123',
        role: 'Staf',
      })
      users.staf.push(user)
    }

    // Siswa users
    for (let i = 1; i <= 20; i++) {
      const user = await User.create({
        fullName: `${this.generateNama()}`,
        email: `siswa${i}@sekolah.sch.id`,
        password: 'password123',
        role: 'Siswa',
      })
      users.siswa.push(user)
    }

    // 3. Create DataGuru (20 data)
    console.log('Creating guru data...')
    const semuaGuru = []
    for (let i = 0; i < users.guru.length; i++) {
      const guru = await DataGuru.create({
        nip: this.generateNip(),
        userId: users.guru[i].id,
        alamat: `Jl. ${this.generateNama()} No. ${i + 1}, ${this.acak(this.kota)}`,
        noTelepon: `08${Math.random().toString().substr(2, 9)}`,
        gelarDepan: this.acak(['Dr.', 'Ir.', 'Prof.', null, null, null]),
        gelarBelakang: this.acak(['S.Pd', 'M.Pd', 'S.Pd., M.Pd', 'S.Si']),
        jenisKelamin: this.acak(['Laki-laki', 'Perempuan']),
        tempatLahir: this.acak(this.kota),
        tanggalLahir: new Date(
          1970 + Math.floor(Math.random() * 30),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        agama: this.acak(this.agama),
        fileFoto: `guru/profile_${i + 1}.jpg`,
      })
      semuaGuru.push(guru)
    }

    // 4. Create DataSiswa (20 data)
    console.log('Creating siswa data...')
    const semuaSiswa = []
    for (let i = 0; i < users.siswa.length; i++) {
      const siswa = await DataSiswa.create({
        nisn: this.generateNisn(),
        userId: users.siswa[i].id,
        jenisKelamin: this.acak(['Laki-laki', 'Perempuan']),
        nik: Math.random().toString().substr(2, 16),
        noKk: Math.random().toString().substr(2, 16),
        tempatLahir: this.acak(this.kota),
        tanggalLahir: new Date(
          2005 + Math.floor(Math.random() * 5),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        noAktaLahir: `${Math.floor(Math.random() * 9000) + 1000}/200${Math.floor(Math.random() * 5) + 5}`,
        agama: this.acak(this.agama),
        kewarganegaraan: 'WNI',
        alamat: `Jl. Siswa No. ${i + 1}, ${this.acak(this.kota)}`,
        rt: (Math.floor(Math.random() * 10) + 1).toString().padStart(3, '0'),
        rw: (Math.floor(Math.random() * 10) + 1).toString().padStart(3, '0'),
        dusun: `Dusun ${i + 1}`,
        kelurahan: `Kelurahan ${this.acak(this.kota)}`,
        kecamatan: `Kecamatan ${this.acak(this.kota)}`,
        kodePos: '40' + Math.floor(Math.random() * 900) + 100,
        jenisTinggal: this.acak(['Orang Tua', 'Kost', 'Asrama']),
        transportasi: this.acak(['Sepeda Motor', 'Angkutan Umum', 'Jalan Kaki', 'Sepeda']),
        anakKe: (Math.floor(Math.random() * 5) + 1).toString(),
        jumlahSaudara: (Math.floor(Math.random() * 6) + 1).toString(),
        penerimaKip: this.acak(['Iya', 'Tidak']),
        noTelepon: `08${Math.random().toString().substr(2, 9)}`,
        beratBadan: (Math.floor(Math.random() * 40) + 40).toString(),
        tinggiBadan: (Math.floor(Math.random() * 45) + 140).toString(),
        jarakSekolah: (Math.floor(Math.random() * 20) + 1).toString(),
        waktuTempuh: (Math.floor(Math.random() * 55) + 5).toString(),
        jenisKesejahteraan: this.acak([
          'PROGRAM KELUARGA HARAPAN',
          'KARTU INDONESIA PINTAR',
          'TIDAK ADA',
        ]),
        jenisPendaftaran: this.acak(['SISWA BARU', 'PINDAHAN']),
        sekolahAsal: `SMP ${this.acak(this.kota)}`,
        status: this.acak(['siswa']),
        hobby: this.acak(['Sepak Bola', 'Basket', 'Musik', 'Membaca']),
        citacita: this.acak(['Dokter', 'Insinyur', 'Guru', 'Programmer']),
        fileFoto: `siswa/profile_${i + 1}.jpg`,
      })
      semuaSiswa.push(siswa)
    }

    // 5. Create DataStaf (20 data)
    console.log('Creating staf data...')
    const semuaStaf = []
    for (let i = 0; i < users.staf.length; i++) {
      const staf = await DataStaf.create({
        nip: this.generateNip(),
        userId: users.staf[i].id,
        departemen: this.acak(['Administrasi', 'Keuangan', 'Multimedia']),
        jabatan: this.acak(['Staf', 'Kepala']),
        alamat: `Jl. Staf No. ${i + 1}, ${this.acak(this.kota)}`,
        noTelepon: `08${Math.random().toString().substr(2, 9)}`,
        gelarDepan: this.acak([null, 'S.E.', 'S.IP']),
        gelarBelakang: this.acak(['S.IP', 'S.E.', 'A.Md']),
        jenisKelamin: this.acak(['Laki-laki', 'Perempuan']),
        tempatLahir: this.acak(this.kota),
        tanggalLahir: new Date(
          1975 + Math.floor(Math.random() * 25),
          Math.floor(Math.random() * 12),
          Math.floor(Math.random() * 28) + 1
        ),
        agama: this.acak(this.agama),
        fileFoto: `staf/profile_${i + 1}.jpg`,
      })
      semuaStaf.push(staf)
    }

    // 6. Create DataWali (1-2 wali per siswa)
    console.log('Creating wali data...')
    for (const siswa of semuaSiswa) {
      const jumlahWali = Math.random() > 0.3 ? 2 : 1 // 70% punya 2 wali, 30% punya 1 wali

      for (let i = 0; i < jumlahWali; i++) {
        await DataWali.create({
          nisn: siswa.nisn,
          nik: Math.random().toString().substr(2, 16),
          nama: i === 0 ? `Ayah ${siswa.nisn}` : `Ibu ${siswa.nisn}`,
          tanggalLahir: new Date(
            1970 + Math.floor(Math.random() * 20),
            Math.floor(Math.random() * 12),
            Math.floor(Math.random() * 28) + 1
          ),
          pendidikan: this.acak(['10', '11', '12']),
          pekerjaan: this.acak(this.pekerjaan),
          penghasilan: i === 0 ? (Math.floor(Math.random() * 10000000) + 2000000).toString() : null,
          noHp: `08${Math.random().toString().substr(2, 9)}`,
          hubungan: i === 0 ? 'Ayah' : 'Ibu',
        })
      }
    }

    // 7. Create DataMapel (7 data)
    console.log('Creating mata pelajaran...')
    const semuaMapel = []
    const nipGuru = semuaGuru.map((g) => g.nip)

    for (let i = 0; i < 7; i++) {
      const jumlahGuru = Math.floor(Math.random() * 3) + 1
      const guruTerpilih = this.acakArray(nipGuru).slice(0, jumlahGuru)

      const mapel = await DataMapel.create({
        namaMataPelajaran: this.mapelList[i],
        jenjang: this.acak(['10', '11', '12']),
        guruAmpu: JSON.stringify(guruTerpilih),
      })
      semuaMapel.push(mapel)
    }

    // 8. Create DataKelas (7 data)
    console.log('Creating kelas...')
    const semuaKelas = []
    const nisnSiswa = semuaSiswa.map((s) => s.nisn)
    const siswaTerpakai = new Set()

    const kelasList = [
      { nama: 'X IPA 1', jenjang: '10' },
      { nama: 'X IPA 2', jenjang: '10' },
      { nama: 'XI IPA 1', jenjang: '11' },
      { nama: 'XI IPA 2', jenjang: '11' },
      { nama: 'XII IPA 1', jenjang: '12' },
      { nama: 'XII IPA 2', jenjang: '12' },
      { nama: 'XII IPA 3', jenjang: '12' },
    ]

    for (let i = 0; i < kelasList.length; i++) {
      const waliKelas = this.acak(semuaGuru).nip
      const jumlahSiswa = Math.floor(Math.random() * 5) + 5

      const siswaTersedia = nisnSiswa.filter((nisn) => !siswaTerpakai.has(nisn))
      const siswaTerpilih = this.acakArray(siswaTersedia).slice(
        0,
        Math.min(jumlahSiswa, siswaTersedia.length)
      )

      siswaTerpilih.forEach((nisn) => siswaTerpakai.add(nisn))

      const jumlahGuru = Math.floor(Math.random() * 3) + 2
      const guruTerpilih = this.acakArray(nipGuru).slice(0, jumlahGuru)

      const kelas = await DataKelas.create({
        jenjang: kelasList[i].jenjang, // PERUBAHAN DI SINI - gunakan '10', '11', '12'
        namaKelas: kelasList[i].nama,
        waliKelas,
        guruPengampu: JSON.stringify(guruTerpilih),
        siswa: JSON.stringify(siswaTerpilih),
      })
      semuaKelas.push(kelas)
    }

    // 9. Create DataJurusan (7 data)
    console.log('Creating jurusan...')
    const idKelas = semuaKelas.map((k) => k.id)

    for (let i = 0; i < 3; i++) {
      // Hanya 3 jurusan utama
      const jumlahKelas = Math.floor(Math.random() * 3) + 2
      const kelasTerpilih = this.acakArray(idKelas).slice(0, jumlahKelas)

      await DataJurusan.create({
        kodeJurusan: this.jurusanList[i].substr(0, 3).toUpperCase(),
        namaJurusan: this.jurusanList[i],
        akreditasi: this.acak(['A', 'B']),
        kelasId: kelasTerpilih,
      })
    }

    // 10. Create DataTahunAjaran (7 data)
    console.log('Creating tahun ajaran...')
    const tahunList = [
      { kode: '2024-2025', tahun: '2024/2025' },
      { kode: '2023-2024', tahun: '2023/2024' },
      { kode: '2022-2023', tahun: '2022/2023' },
      { kode: '2021-2022', tahun: '2021/2022' },
      { kode: '2020-2021', tahun: '2020/2021' },
      { kode: '2019-2020', tahun: '2019/2020' },
      { kode: '2018-2019', tahun: '2018/2019' },
    ]

    for (const tahun of tahunList) {
      await DataTahunAjaran.create({
        kodeTa: tahun.kode,
        tahunAjaran: tahun.tahun,
        kepalaSekolah: superAdmin.id,
      })
    }

    // 11. Create DataInformasi (7 data)
    console.log('Creating informasi...')
    const informasiList = [
      {
        judul: 'Pengumuman Penerimaan Siswa Baru',
        deskripsi:
          'Penerimaan siswa baru tahun ajaran 2024/2025 akan dibuka mulai tanggal 1 Maret 2024.',
        roleTujuan: 'Siswa',
      },
      {
        judul: 'Rapat Guru dan Staf',
        deskripsi: 'Akan diadakan rapat rutin guru dan staf pada hari Jumat, 15 Maret 2024.',
        roleTujuan: 'Guru',
      },
      {
        judul: 'Jadwal Ujian Semester',
        deskripsi: 'Berikut adalah jadwal ujian semester genap tahun ajaran 2023/2024.',
        roleTujuan: 'Siswa',
      },
      {
        judul: 'Pelatihan Guru',
        deskripsi: 'Pelatihan peningkatan kompetensi guru akan dilaksanakan pada bulan April 2024.',
        roleTujuan: 'Guru',
      },
      {
        judul: 'Pembayaran SPP',
        deskripsi: 'Pembayaran SPP bulan April 2024 dapat dilakukan mulai tanggal 1 April.',
        roleTujuan: 'Siswa',
      },
      {
        judul: 'Workshop Administrasi',
        deskripsi: 'Workshop sistem administrasi sekolah untuk staf TU.',
        roleTujuan: 'Staf',
      },
      {
        judul: 'Libur Semester',
        deskripsi: 'Libur semester genap akan dimulai tanggal 15 Juni 2024.',
        roleTujuan: 'Semua',
      },
    ]

    for (const info of informasiList) {
      const publishAt = new Date()
      const closeAt = new Date()
      closeAt.setDate(publishAt.getDate() + 30)

      await DataInformasi.create({
        judul: info.judul,
        deskripsi: info.deskripsi,
        roleTujuan: info.roleTujuan,
      })
    }

    // 12. Create DataAktivitas (7 data)
    console.log('Creating aktivitas...')
    const aktivitasList = [
      { jenis: 'ekstrakurikuler', nama: 'Pramuka' },
      { jenis: 'studi_tour', nama: 'Kunjungan ke Museum' },
      { jenis: 'lomba', nama: 'Cerdas Cermat' },
      { jenis: 'prestasi', nama: 'Olimpiade Sains' },
      { jenis: 'bakti_sosial', nama: 'Bakti Sosial' },
      { jenis: 'upacara', nama: 'Upacara Bendera' },
      { jenis: 'lainnya', nama: 'Workshop Kreativitas' },
    ]

    for (let i = 0; i < aktivitasList.length; i++) {
      const createdBy = i < 3 ? superAdmin.id : '35a6fd94-b179-4ffe-95d7-f2e09c386c9f'

      await DataAktivita.create({
        id: randomUUID(),
        nama: aktivitasList[i].nama,
        jenis: aktivitasList[i].jenis,
        deskripsi: `Deskripsi kegiatan ${aktivitasList[i].nama} yang dilaksanakan sekolah. Kegiatan ini bertujuan untuk meningkatkan ${this.acak(['pengetahuan', 'keterampilan', 'karakter'])} siswa.`,
        lokasi: this.acak(this.kota),
        tanggalPelaksanaan: new Date(
          2024,
          Math.floor(Math.random() * 6),
          Math.floor(Math.random() * 28) + 1
        ),
        status: this.acak(['draft', 'published']),
        dokumentasi: Math.random() > 0.5 ? `aktivitas/foto_${i + 1}.jpg` : null,
        createdBy,
      })
    }

    // 13. Create Blog (7 data)
    console.log('Creating blog posts...')
    const blogList = [
      { judul: 'Tips Belajar Efektif untuk Siswa', kategori: 'Pendidikan' },
      { judul: 'Pentingnya Pendidikan Karakter', kategori: 'Pendidikan' },
      { judul: 'Teknologi dalam Pembelajaran', kategori: 'Teknologi' },
      { judul: 'Membangun Budaya Membaca', kategori: 'Literasi' },
      { judul: 'Pengembangan Bakat Siswa', kategori: 'Pengembangan' },
      { judul: 'Manajemen Waktu untuk Guru', kategori: 'Profesional' },
      { judul: 'Inovasi Pembelajaran di Era Digital', kategori: 'Inovasi' },
    ]

    const semuaPenulis = [...users.guru.slice(0, 5), ...users.staf.slice(0, 2)]

    for (let i = 0; i < blogList.length; i++) {
      const penulis = this.acak(semuaPenulis)
      const status = this.acak(['draft', 'published', 'published']) // Lebih banyak published
      const publishedAt =
        status === 'published'
          ? DateTime.now().minus({ days: Math.floor(Math.random() * 30) })
          : null

      await Blog.create({
        judul: blogList[i].judul,
        slug: blogList[i].judul
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-'),
        konten: `<p>Ini adalah konten artikel tentang ${blogList[i].judul}. Artikel ini membahas berbagai hal penting yang perlu diketahui oleh ${blogList[i].kategori === 'Pendidikan' ? 'siswa dan guru' : 'pembaca'}.</p><p>${blogList[i].judul} merupakan topik yang sangat relevan dengan perkembangan pendidikan saat ini.</p>`,
        ringkasan: `Ringkasan tentang ${blogList[i].judul.toLowerCase()}`,
        thumbnail: Math.random() > 0.3 ? `blog/thumbnail_${i + 1}.jpg` : null,
        status,
        kategori: blogList[i].kategori,
        tags: blogList[i].kategori.toLowerCase(),
        dilihat: Math.floor(Math.random() * 500),
        penulisId: penulis.id,
        publishedAt,
      })
    }

    // 14. Create DataAbsensi (7 data per hari selama 7 hari)
    console.log('Creating absensi...')
    for (let day = 0; day < 7; day++) {
      const hari = DateTime.now().minus({ days: day })

      for (let i = 0; i < 7; i++) {
        const user = this.acak(users.siswa)
        const mapel = this.acak(semuaMapel)
        const kelas = this.acak(semuaKelas)

        await DataAbsensi.create({
          userId: user.id,
          mapelId: mapel.id,
          kelasId: kelas.id,
          status: this.acak(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
          hari,
        })
      }
    }

    // 16. Create DataAbsensiWaliKelas (7 data)
    console.log('Creating absensi wali kelas...')
    for (let i = 0; i < 7; i++) {
      const guru = this.acak(users.guru)
      const kelas = this.acak(semuaKelas)

      await DataAbsensiWaliKelas.create({
        userId: guru.id,
        kelasId: kelas.id,
        status: this.acak(['Hadir', 'Sakit', 'Izin']),
        hari: DateTime.now().minus({ days: i }),
      })
    }

    console.log('✅ Database seeding completed successfully!')
    console.log('📊 Summary:')
    console.log(`   👥 Users: ${await User.query().count('* as total')} total`)
    console.log(`   👨‍🏫 Guru: ${await DataGuru.query().count('* as total')}`)
    console.log(`   👨‍🎓 Siswa: ${await DataSiswa.query().count('* as total')}`)
    console.log(`   👨‍💼 Staf: ${await DataStaf.query().count('* as total')}`)
    console.log(`   👨‍👩‍👧‍👦 Wali: ${await DataWali.query().count('* as total')}`)
    console.log(`   📚 Mapel: ${await DataMapel.query().count('* as total')}`)
    console.log(`   🏫 Kelas: ${await DataKelas.query().count('* as total')}`)
  }
}
