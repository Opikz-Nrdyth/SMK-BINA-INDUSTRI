export interface AbsensiSiswa {
  userId: string
  fullName: string
  nisn: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
}

export interface AbsensiForm {
  tanggal: string
  kelasId: string
  mapelId: string
  absensi: AbsensiSiswa[]
}

export interface AbsensiRecord {
  userId: string
  mapelId: string
  kelasId: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
  hari: string
}

export interface AbsensiItem {
  id?: number
  userId: string
  mapelId: string
  kelasId: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
  hari: string
  userName?: string
  mapelName?: string
  kelasName?: string
  createdAt?: string
  updatedAt?: string
}

export interface OfflineAbsensiRecord extends AbsensiRecord {
  id?: number
  syncStatus: 'pending' | 'synced'
  createdAt: string
}
