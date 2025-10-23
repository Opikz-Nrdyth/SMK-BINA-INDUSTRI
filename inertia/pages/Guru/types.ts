import { User } from '../Siswa/types'

export interface Guru {
  nip: string
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

export interface GuruFormData {
  user: {
    fullName: string
    email: string
    password?: string
    role?: string
    password_confirmation?: string
  }
  guru: Omit<Guru, 'userId' | 'user'>
}
