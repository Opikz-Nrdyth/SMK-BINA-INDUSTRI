// resources/js/Pages/SiswaPraregist/types.ts
export interface SiswaPraregist {
  nisn: string
  user: {
    fullName: string
    email: string
  }
  jenisKelamin: string
  tempatLahir: string
  tanggalLahir: string
  agama: string
  sekolahAsal: string
  status: 'praregist' | 'daftarulang' | 'siswa'
  nama_kelas?: string
  dataWalis?: any[]
  // ... properti lainnya sama seperti Siswa
}

export interface SiswaPraregistFormData {
  user: {
    fullName: string
    email: string
    password?: string
    password_confirmation?: string
  }
  siswa: {
    nisn: string
    nik: string
    noAktaLahir: string
    noKk: string
    jenisKelamin: string
    tempatLahir: string
    tanggalLahir: string
    agama: string
    kewarganegaraan: string
    alamat: string
    rt: string
    rw: string
    dusun: string
    kelurahan: string
    kecamatan: string
    kodePos: string
    jenisTinggal: string
    transportasi: string
    noTelepon: string
    anakKe: string
    jumlahSaudara: string
    penerimaKip: string
    beratBadan: string
    tinggiBadan: string
    lingkarKepala: string
    jarakSekolah: string
    waktuTempuh: string
    jenisKesejahteraan: string
    nomorKartu: string
    namaDiKartu: string
    jenisPendaftaran: string
    sekolahAsal: string
    npsn: string
    sekolahAsalPindahan: string
    suratKeteranganPindah: string
    hobby: string
    citacita: string
    noKps: string
    fileAkta: string
    fileKk: string
    fileIjazah: string
    fileFoto: string
    status: 'praregist' | 'daftarulang'
  }
  walis: any[]
}
