import { User } from '../Siswa/types'

export interface Staf {
  nip: string
  departemen: string
  jabatan: string
  alamat: string
  noTelepon: string
  gelarDepan: string
  gelarBelakang: string
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  agama: string
  user: User
  fileFoto: any
}

export interface StafFormData {
  user: {
    fullName: string
    email: string
    password?: string
    role: string
    password_confirmation?: string
  }
  staf: Omit<Staf, 'userId' | 'user'>
}
