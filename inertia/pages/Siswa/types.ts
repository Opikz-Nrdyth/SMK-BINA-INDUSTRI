export interface User {
  id: number
  fullName: string
  email: string
}

export interface Siswa {
  id: number
  userId: number
  nisn: string
  nik?: string | null
  noAktaLahir: string
  noKk?: string | null
  jenisKelamin: 'Laki-laki' | 'Perempuan'
  tempatLahir: string
  tanggalLahir: string
  agama: string
  kewarganegaraan: 'WNI' | 'WNA'
  alamat: string
  rt: string
  rw: string
  dusun?: string | null
  kelurahan?: string | null
  kecamatan: string
  kodePos: string
  jenisTinggal: string
  transportasi?: string | null
  noTelepon: string
  anakKe: string
  jumlahSaudara: string
  penerimaKip: 'Iya' | 'Tidak'
  beratBadan?: string | null
  tinggiBadan?: string | null
  lingkarKepala?: string | null
  jarakSekolah?: string | null
  waktuTempuh?: string | null
  jenisKesejahteraan:
    | 'PROGRAM KELUARGA HARAPAN'
    | 'KARTU INDONESIA PINTAR'
    | 'KARTU PERLINDUNGAN SOSIAL'
    | 'KARTU KELUARGA SEJAHTERA'
    | 'KARTU KESEHATAN'
    | 'TIDAK ADA'
  nomorKartu?: string | null
  namaDiKartu?: string | null
  jenisPendaftaran: 'SISWA BARU' | 'PINDAHAN' | 'KEMBALI BERSEKOLAH'
  sekolahAsal: string
  npsn?: string | null
  sekolahAsalPindahan?: string | null
  suratKeteranganPindah?: string | null
  hobby?: string | null
  citacita?: string | null
  noKps?: string | null
  fileAkta?: string | null
  fileKk?: string | null
  fileIjazah?: string | null
  fileFoto?: string | null
  createdAt: string
  updatedAt: string | null
  user: User
  dataWalis?: Wali[]
  nama_kelas?: string
  jenis_kelas?: 'diampu' | 'wali'
  nomor_absen?: number
}

export interface Wali {
  id?: number
  nik: string
  nama: string
  tanggalLahir: string
  pendidikan: string
  pekerjaan: string
  penghasilan?: string | null
}

export interface SiswaFormData {
  user: {
    fullName: string
    email: string
    password?: string
    password_confirmation?: string
  }
  siswa: Omit<
    Siswa,
    | 'id'
    | 'userId'
    | 'user'
    | 'createdAt'
    | 'updatedAt'
    | 'nama_kelas'
    | 'jenis_kelas'
    | 'nomor_absen'
  >
  walis: Wali[]
}
