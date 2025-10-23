// app/validators/data_siswa.ts
import vine from '@vinejs/vine'

export const userSiswaValidator = vine.compile(
  vine.object({
    user: vine.object({
      fullName: vine.string().minLength(3),
      email: vine.string().email(),
      password: vine.string().minLength(8).confirmed().optional(),
    }),

    siswa: vine.object({
      nisn: vine.number(),
      nik: vine.number().nullable(),
      noAktaLahir: vine.string(),
      noKk: vine.number().nullable(),
      jenisKelamin: vine.enum(['Laki-laki', 'Perempuan']),
      tempatLahir: vine.string(),
      tanggalLahir: vine.date(),
      agama: vine.string(),
      kewarganegaraan: vine.enum(['WNI', 'WNA']),
      alamat: vine.string(),
      rt: vine.number(),
      rw: vine.number(),
      dusun: vine.string().nullable(),
      kelurahan: vine.string().nullable(),
      kecamatan: vine.string(),
      kodePos: vine.string(),
      jenisTinggal: vine.string(),
      transportasi: vine.string().nullable(),
      noTelepon: vine.string(),
      anakKe: vine.number(),
      jumlahSaudara: vine.number(),
      penerimaKip: vine.enum(['Iya', 'Tidak']),
      beratBadan: vine.number().nullable(),
      tinggiBadan: vine.number().nullable(),
      lingkarKepala: vine.number().nullable(),
      jarakSekolah: vine.number().nullable(),
      waktuTempuh: vine.number().nullable(),
      jenisKesejahteraan: vine.enum([
        'PROGRAM KELUARGA HARAPAN',
        'KARTU INDONESIA PINTAR',
        'KARTU PERLINDUNGAN SOSIAL',
        'KARTU KELUARGA SEJAHTERA',
        'KARTU KESEHATAN',
        'TIDAK ADA',
      ]),
      nomorKartu: vine.number().nullable(),
      namaDiKartu: vine.string().nullable(),
      jenisPendaftaran: vine.enum(['SISWA BARU', 'PINDAHAN', 'KEMBALI BERSEKOLAH']),
      status: vine.enum(['praregist', 'daftarulang', 'siswa']).optional(),
      sekolahAsal: vine.string(),
      npsn: vine.number().nullable(),
      sekolahAsalPindahan: vine.string().nullable(),
      suratKeteranganPindah: vine.string().nullable(),
      hobby: vine.string().nullable(),
      citacita: vine.string().nullable(),
      noKps: vine.number().nullable(),
    }),
    walis: vine
      .array(
        vine.object({
          nik: vine.string(),
          nama: vine.string(),
          tanggalLahir: vine.date(),
          pendidikan: vine.string(),
          pekerjaan: vine.string(),
          penghasilan: vine.string().nullable(),
        })
      )
      .minLength(1),
  })
)
