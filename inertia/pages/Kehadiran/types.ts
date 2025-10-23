// resources/js/Pages/Kehadiran/types.ts

export interface User {
  id: string
  fullName: string
  email: string
}

export interface BankSoal {
  id: string
  namaUjian: string
  jenjang: string
  jurusan: string[]
  kode: string
  jenisUjian: 'Ujian Sekolah' | 'Ujian Mandiri'
  penulis: string[]
  waktu: string
  tanggalUjian: string
}

export interface Kehadiran {
  id: string
  userId: string
  ujianId: string
  skor: string
  benar: string
  salah: string
  jawabanFile: string
  createdAt: string
  updatedAt: string
  user: User
  ujian: BankSoal
}

export interface JawabanItem {
  id: string
  soal: string
  jawaban: string
}
