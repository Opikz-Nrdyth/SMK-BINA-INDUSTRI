export interface Pembayaran {
  userId: string
  jenisPembayaran: string
  nominalPenetapan: string
}

export interface TambahPembayaran {
  nominal: string
  tanggal: string
}

export interface RiwayatPembayaran {
  nominal: string
  tanggal: string
}

export interface PembayaranItem {
  id?: string
  userId: string
  jenisPembayaran: string
  nominalPenetapan: string
  nominalBayar: string
  userName?: string
  totalDibayar?: number
  sisaPembayaran?: number
  lunas?: boolean
  riwayatPembayaran?: RiwayatPembayaran[]
  createdAt?: string
  updatedAt?: string
}
