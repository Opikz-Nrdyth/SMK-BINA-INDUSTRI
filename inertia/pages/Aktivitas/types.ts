export interface Aktivitas {
  id?: string
  nama: string
  jenis:
    | 'ekstrakurikuler'
    | 'studi_tour'
    | 'lomba'
    | 'prestasi'
    | 'bakti_sosial'
    | 'upacara'
    | 'lainnya'
  deskripsi: string
  lokasi: string
  tanggal_pelaksanaan: string
  status: 'draft' | 'published'
  dokumentasi?: File | string | null
  createdAt?: string
  updatedAt?: string
}
