// resources/js/Pages/absensi_wali_kelas/types.ts
export interface AbsensiSiswaWali {
  userId: string
  fullName: string
  nisn: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
}

export interface AbsensiFormWali {
  tanggal: string
  kelasId: string
  absensi: AbsensiSiswaWali[]
}

export interface AbsensiRecordWali {
  userId: string
  kelasId: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
  hari: string
}

export interface AbsensiItemWali {
  id?: number
  userId: string
  kelasId: string
  status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'
  hari: string
  userName?: string
  kelasName?: string
  createdAt?: string
  updatedAt?: string
}

export interface OfflineAbsensiRecordWali extends AbsensiRecordWali {
  id?: number
  syncStatus: 'pending' | 'synced'
  createdAt: string
}
