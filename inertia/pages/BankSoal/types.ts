// resources/js/Pages/BankSoal/types.ts
export interface BankSoal {
  id: string
  namaUjian: string
  jenjang: string
  jurusan: string[]
  kode: string
  jenisUjian: 'Ujian Sekolah' | 'Ujian Mandiri'
  penulis: string[]
  mapel: string
  waktu: string
  tanggalUjian: string
  soalFile: string
  createdAt: string
  updatedAt: string
  mapelId?: any
  jurusanDetails?: string[]
  penulisDetails?: string[]
}

export interface BankSoalFormData {
  namaUjian: string
  jenjang: string
  jurusan: string[]
  jenisUjian: 'Ujian Sekolah' | 'Ujian Mandiri'
  penulis: string[]
  mapelId?: number
  mapel: string
  waktu: string
  kode: string
  tanggalUjian: string
  soalFile: string
}

export interface JurusanOption {
  id: string
  namaJurusan: string
}

export interface UserOption {
  id: string
  fullName: string
}

export interface MapelOption {
  id: string
  namaMataPelajaran: string
}

export interface SoalItem {
  id: any
  soal: string
  A: string
  B: string
  C: string
  D: string
  E: string
  kunci: 'A' | 'B' | 'C' | 'D' | 'E' | any
  syncStatus?: 'pending' | 'synced' | 'unsaved'
  createdAt?: string
  tempId?: string
}

export interface EditSoalProps {
  bankSoal: BankSoal
  soalContent: SoalItem[]
}

export interface OfflineSoalRecord extends SoalItem {
  bankSoalId: string
  syncStatus: 'pending' | 'synced'
  createdAt: string
  updatedAt?: string
}
