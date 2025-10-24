import React, { useEffect, useState } from 'react'
import { Head, useForm, usePage } from '@inertiajs/react'
import UniversalInput, { Option } from '~/Components/UniversalInput'
import { offlineStorage } from './offline_storage_service'
import { useNotification } from '~/Components/NotificationAlert'

interface PPDBFormProps {
  errors?: Record<string, string>
  jurusanOptions: Option[]
}

const pendidikanOptions = [
  { value: 'Tidak Sekolah', label: 'Tidak Sekolah' },
  { value: 'SD', label: 'SD' },
  { value: 'SMP', label: 'SMP' },
  { value: 'SMA', label: 'SMA' },
  { value: 'D1', label: 'D1' },
  { value: 'D2', label: 'D2' },
  { value: 'D3', label: 'D3' },
  { value: 'S1', label: 'S1' },
  { value: 'S2', label: 'S2' },
  { value: 'S3', label: 'S3' },
]

const steps = [
  { id: 1, label: 'Data Calon Siswa', icon: '👤' },
  { id: 2, label: 'Data Orang Tua', icon: '👨‍👩‍👧‍👦' },
  { id: 3, label: 'Data Wali', icon: '👨‍💼' },
  { id: 4, label: 'Data Periodik', icon: '📊' },
  { id: 5, label: 'Data Kesehatan', icon: '🏥' },
  { id: 6, label: 'Data Registrasi', icon: '🎓' },
  { id: 7, label: 'Upload Dokumen', icon: '📄' },
  { id: 8, label: 'Konfirmasi', icon: '✅' },
]

export default function PPDBForm({ errors, jurusanOptions }: PPDBFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isWaliSamaOrtu, setIsWaliSamaOrtu] = useState(false)
  const [isStorageSupported, setIsStorageSupported] = useState(false)
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  const { notify } = useNotification()

  const [hasLoaded, setHasLoaded] = useState(false)

  const { data, setData, post } = useForm({
    // DATA CALON SISWA
    nisn: '',
    nama: '',
    jenisKelamin: '' as 'Laki-laki' | 'Perempuan' | '',
    nik: '',
    noKk: '',
    tempatLahir: '',
    tanggalLahir: '',
    noAktaLahir: '',
    agama: '',
    kewarganegaraan: '' as 'WNI' | 'WNA' | '',

    // DATA ORANG TUA
    namaAyah: '',
    namaIbu: '',
    nikAyah: '',
    nikIbu: '',
    pendidikanAyah: '',
    pendidikanIbu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    penghasilanAyah: '',
    penghasilanIbu: '',
    tanggalLahirAyah: '',
    tanggalLahirIbu: '',
    noHpOrtu: '',

    // DATA WALI
    namaWali: '',
    nikWali: '',
    pekerjaanWali: '',
    penghasilanWali: '',
    hubunganDenganWali: '',
    tanggalLahirWali: '',

    // DATA PERIODIK
    alamat: '',
    rt: '',
    rw: '',
    dusun: '',
    kelurahan: '',
    kecamatan: '',
    kodePos: '',
    noTelepon: '',
    anakKe: '',
    jumlahSaudara: '',
    hobby: '',
    citacita: '',

    // DATA KESEHATAN
    beratBadan: '',
    tinggiBadan: '',
    lingkarKepala: '',
    golonganDarah: '',
    riwayatPenyakit: '',

    // KESEJAHTERAAN
    penerimaKip: '' as 'Iya' | 'Tidak' | '',
    jenisKesejahteraan: '' as
      | 'PROGRAM KELUARGA HARAPAN'
      | 'KARTU INDONESIA PINTAR'
      | 'KARTU PERLINDUNGAN SOSIAL'
      | 'KARTU KELUARGA SEJAHTERA'
      | 'KARTU KESEHATAN'
      | 'TIDAK ADA'
      | '',
    nomorKartu: '',
    namaDiKartu: '',
    noKps: '',

    // REGISTRASI
    email: '',
    password: '',
    jenisPendaftaran: '' as 'SISWA BARU' | 'PINDAHAN' | 'KEMBALI BERSEKOLAH' | '',
    sekolahAsal: '',
    npsn: '',
    sekolahAsalPindahan: '',
    suratKeteranganPindah: '',
    jarakSekolah: '',
    waktuTempuh: '',
    jenisTinggal: '',
    transportasi: '',

    // DOKUMEN
    fileAkta: null as File | null,
    fileKk: null as File | null,
    fileIjazah: null as File | null,
    fileFoto: null as File | null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    post('/ppdb/register', {
      onSuccess: ({ props }) => {
        const session = props.session as any
        if (session.status == 'error') {
          session.error.messages.map((m: any) => notify(m.message, 'error', 10000))
        }

        if (session.status == 'success') {
        }
      },
      onFinish: () => setIsSubmitting(false),
      forceFormData: true,
    })
  }

  useEffect(() => {
    setIsStorageSupported(offlineStorage.isStorageSupported())

    const getData = async () => {
      const pendingData = await offlineStorage.getPending()
      if (pendingData.length > 0 && offlineStorage.isStorageSupported()) {
        setData(pendingData[0]?.ppdb)
      }
      setHasLoaded(true)
    }

    getData()
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length))
  const handlePrev = () => setStep((prev) => Math.max(prev - 1, 1))

  // Fungsi untuk mengisi data wali sama dengan data orang tua
  const handleWaliSamaOrtu = (checked: boolean) => {
    setIsWaliSamaOrtu(checked)
    if (checked) {
      setData((prev) => ({
        ...prev,
        namaWali: data.namaAyah,
        nikWali: data.nikAyah,
        pekerjaanWali: data.pekerjaanAyah,
        penghasilanWali: data.penghasilanAyah,
        hubunganDenganWali: 'Ayah Kandung',
        tanggalLahirWali: data.tanggalLahirAyah,
      }))
    } else {
      setData((prev) => ({
        ...prev,
        namaWali: '',
        nikWali: '',
        pekerjaanWali: '',
        penghasilanWali: '',
        hubunganDenganWali: '',
        tanggalLahirWali: '',
      }))
    }
  }

  useEffect(() => {
    if (!hasLoaded) return
    const timeout = setTimeout(() => {
      offlineStorage.save(data)
    }, 1000)

    return () => clearTimeout(timeout)
  }, [data, hasLoaded])

  offlineStorage.clearSyncedData()

  const Stepper = () => (
    <ol className="flex items-center w-full mb-8">
      {steps.map((s, index) => {
        const isActive = step === s.id
        const isCompleted = step > s.id
        const isLast = index === steps.length - 1

        return (
          <li
            key={s.id}
            onClick={() => {
              setStep(s.id)
            }}
            className={`flex items-center ${!isLast ? 'w-full after:content-[""] after:w-full after:h-1 after:border-b after:border-4 after:inline-block' : ''} ${isCompleted && !isLast ? 'after:border-purple-500' : 'after:border-gray-200'}`}
          >
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full lg:h-12 lg:w-12 dark:bg-purple-800 shrink-0">
              <span
                className={`text-lg ${isActive || isCompleted ? 'text-purple-600 dark:text-purple-300' : 'text-gray-500'}`}
              >
                {isCompleted ? '✓' : s.icon}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <Head title="PPDB - Pendaftaran Peserta Didik Baru" />

      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400">Formulir PPDB</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Pendaftaran Peserta Didik Baru - Isi data dengan benar dan lengkap
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Stepper />

          <form onSubmit={handleSubmit}>
            {/* Step 1: DATA CALON SISWA */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Calon Siswa
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="number"
                    name="nisn"
                    label="NISN"
                    value={data.nisn}
                    onChange={(value: any) => setData('nisn', value)}
                    placeholder="10 digit NISN"
                    required
                    onError={errors?.nisn}
                    noSpace
                  />

                  <UniversalInput
                    type="text"
                    name="nama"
                    label="Nama Lengkap"
                    value={data.nama}
                    onChange={(value: any) => setData('nama', value)}
                    placeholder="Nama lengkap sesuai akta"
                    required
                    onError={errors?.nama}
                    uppercase
                  />

                  <UniversalInput
                    type="select"
                    name="jenisKelamin"
                    label="Jenis Kelamin"
                    value={data.jenisKelamin}
                    onChange={(value: any) => setData('jenisKelamin', value)}
                    options={[
                      { value: 'Laki-laki', label: 'Laki-laki' },
                      { value: 'Perempuan', label: 'Perempuan' },
                    ]}
                    required
                    onError={errors?.jenisKelamin}
                  />

                  <UniversalInput
                    type="number"
                    name="nik"
                    label="NIK"
                    value={data.nik}
                    onChange={(value: any) => setData('nik', value)}
                    placeholder="16 digit NIK"
                    required
                    onError={errors?.nik}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="noKk"
                    label="No Kartu Keluarga"
                    value={data.noKk}
                    onChange={(value: any) => setData('noKk', value)}
                    placeholder="Nomor Kartu Keluarga"
                    required
                    onError={errors?.noKk}
                    noSpace
                  />

                  <UniversalInput
                    type="text"
                    name="tempatLahir"
                    label="Tempat Lahir"
                    value={data.tempatLahir}
                    onChange={(value: any) => setData('tempatLahir', value)}
                    placeholder="Kota tempat lahir"
                    required
                    onError={errors?.tempatLahir}
                  />

                  <UniversalInput
                    type="date"
                    name="tanggalLahir"
                    label="Tanggal Lahir"
                    value={data.tanggalLahir}
                    onChange={(value: any) => setData('tanggalLahir', value)}
                    required
                    onError={errors?.tanggalLahir}
                  />

                  <UniversalInput
                    type="text"
                    name="noAktaLahir"
                    label="No Akta Lahir"
                    value={data.noAktaLahir}
                    onChange={(value: any) => setData('noAktaLahir', value)}
                    placeholder="Nomor akta kelahiran"
                    required
                    onError={errors?.noAktaLahir}
                  />

                  <UniversalInput
                    type="select"
                    name="agama"
                    label="Agama"
                    value={data.agama}
                    onChange={(value: any) => setData('agama', value)}
                    options={[
                      { value: 'Islam', label: 'Islam' },
                      { value: 'Kristen Protestan', label: 'Kristen Protestan' },
                      { value: 'Kristen Katolik', label: 'Kristen Katolik' },
                      { value: 'Hindu', label: 'Hindu' },
                      { value: 'Buddha', label: 'Buddha' },
                      { value: 'Khonghucu', label: 'Khonghucu' },
                    ]}
                    required
                    onError={errors?.agama}
                  />

                  <UniversalInput
                    type="select"
                    name="kewarganegaraan"
                    label="Kewarganegaraan"
                    value={data.kewarganegaraan}
                    onChange={(value: any) => setData('kewarganegaraan', value)}
                    options={[
                      { value: 'WNI', label: 'WNI' },
                      { value: 'WNA', label: 'WNA' },
                    ]}
                    required
                    onError={errors?.kewarganegaraan}
                  />
                </div>
              </div>
            )}

            {/* Step 2: DATA ORANG TUA */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Orang Tua
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="text"
                    name="namaAyah"
                    label="Nama Ayah Kandung"
                    value={data.namaAyah}
                    onChange={(value: any) => setData('namaAyah', value)}
                    placeholder="Nama lengkap ayah"
                    required
                    onError={errors?.namaAyah}
                    uppercase
                  />

                  <UniversalInput
                    type="text"
                    name="namaIbu"
                    label="Nama Ibu Kandung"
                    value={data.namaIbu}
                    onChange={(value: any) => setData('namaIbu', value)}
                    placeholder="Nama lengkap ibu"
                    required
                    onError={errors?.namaIbu}
                    uppercase
                  />

                  <UniversalInput
                    type="number"
                    name="nikAyah"
                    label="NIK Ayah"
                    value={data.nikAyah}
                    onChange={(value: any) => setData('nikAyah', value)}
                    placeholder="16 digit NIK ayah"
                    required
                    onError={errors?.nikAyah}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="nikIbu"
                    label="NIK Ibu"
                    value={data.nikIbu}
                    onChange={(value: any) => setData('nikIbu', value)}
                    placeholder="16 digit NIK ibu"
                    required
                    onError={errors?.nikIbu}
                    noSpace
                  />

                  <UniversalInput
                    type="select"
                    name="pendidikanAyah"
                    label="Pendidikan Ayah"
                    value={data.pendidikanAyah}
                    onChange={(value: any) => setData('pendidikanAyah', value)}
                    options={pendidikanOptions}
                    required
                    onError={errors?.pendidikanAyah}
                  />

                  <UniversalInput
                    type="select"
                    name="pendidikanIbu"
                    label="Pendidikan Ibu"
                    value={data.pendidikanIbu}
                    onChange={(value: any) => setData('pendidikanIbu', value)}
                    options={pendidikanOptions}
                    required
                    onError={errors?.pendidikanIbu}
                  />

                  <UniversalInput
                    type="text"
                    name="pekerjaanAyah"
                    label="Pekerjaan Ayah"
                    value={data.pekerjaanAyah}
                    onChange={(value: any) => setData('pekerjaanAyah', value)}
                    placeholder="Pekerjaan ayah"
                    required
                    onError={errors?.pekerjaanAyah}
                  />

                  <UniversalInput
                    type="text"
                    name="pekerjaanIbu"
                    label="Pekerjaan Ibu"
                    value={data.pekerjaanIbu}
                    onChange={(value: any) => setData('pekerjaanIbu', value)}
                    placeholder="Pekerjaan ibu"
                    required
                    onError={errors?.pekerjaanIbu}
                  />

                  <UniversalInput
                    type="currency"
                    name="penghasilanAyah"
                    label="Penghasilan Ayah (Rp)"
                    value={data.penghasilanAyah}
                    onChange={(value: any) => setData('penghasilanAyah', value)}
                    placeholder="Penghasilan ayah per bulan"
                    onError={errors?.penghasilanAyah}
                    noSpace
                  />

                  <UniversalInput
                    type="currency"
                    name="penghasilanIbu"
                    label="Penghasilan Ibu (Rp)"
                    value={data.penghasilanIbu}
                    onChange={(value: any) => setData('penghasilanIbu', value)}
                    placeholder="Penghasilan ibu per bulan"
                    onError={errors?.penghasilanIbu}
                    noSpace
                  />

                  <UniversalInput
                    type="date"
                    name="tanggalLahirAyah"
                    label="Tanggal Lahir Ayah"
                    value={data.tanggalLahirAyah}
                    onChange={(value: any) => setData('tanggalLahirAyah', value)}
                    required
                    onError={errors?.tanggalLahirAyah}
                  />

                  <UniversalInput
                    type="date"
                    name="tanggalLahirIbu"
                    label="Tanggal Lahir"
                    value={data.tanggalLahirIbu}
                    onChange={(value: any) => setData('tanggalLahirIbu', value)}
                    required
                    onError={errors?.tanggalLahirIbu}
                  />

                  <UniversalInput
                    type="tel"
                    name="noHpOrtu"
                    label="No HP Orang Tua"
                    value={data.noHpOrtu}
                    onChange={(value: any) => setData('noHpOrtu', value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    onError={errors?.noHpOrtu}
                    noSpace
                  />
                </div>
              </div>
            )}

            {/* Step 3: DATA WALI */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Wali
                </h2>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isWaliSamaOrtu}
                      onChange={(e) => handleWaliSamaOrtu(e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Data wali sama dengan data orang tua
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="text"
                    name="namaWali"
                    label="Nama Wali"
                    value={data.namaWali}
                    onChange={(value: any) => setData('namaWali', value)}
                    placeholder="Nama lengkap wali"
                    required
                    onError={errors?.namaWali}
                    uppercase
                    disabled={isWaliSamaOrtu}
                  />

                  <UniversalInput
                    type="number"
                    name="nikWali"
                    label="NIK Wali"
                    value={data.nikWali}
                    onChange={(value: any) => setData('nikWali', value)}
                    placeholder="16 digit NIK wali"
                    required
                    onError={errors?.nikWali}
                    noSpace
                    disabled={isWaliSamaOrtu}
                  />

                  <UniversalInput
                    type="text"
                    name="pekerjaanWali"
                    label="Pekerjaan Wali"
                    value={data.pekerjaanWali}
                    onChange={(value: any) => setData('pekerjaanWali', value)}
                    placeholder="Pekerjaan wali"
                    required
                    onError={errors?.pekerjaanWali}
                    disabled={isWaliSamaOrtu}
                  />

                  <UniversalInput
                    type="number"
                    name="penghasilanWali"
                    label="Penghasilan Wali (Rp)"
                    value={data.penghasilanWali}
                    onChange={(value: any) => setData('penghasilanWali', value)}
                    placeholder="Penghasilan wali per bulan"
                    onError={errors?.penghasilanWali}
                    noSpace
                    disabled={isWaliSamaOrtu}
                  />

                  <UniversalInput
                    type="text"
                    name="hubunganDenganWali"
                    label="Hubungan dengan Wali"
                    value={data.hubunganDenganWali}
                    onChange={(value: any) => setData('hubunganDenganWali', value)}
                    placeholder="Contoh: Paman, Kakek, Saudara"
                    required
                    onError={errors?.hubunganDenganWali}
                    disabled={isWaliSamaOrtu}
                  />

                  <UniversalInput
                    type="date"
                    name="tanggalLahirWali"
                    label="Tanggal Lahir"
                    value={data.tanggalLahirWali}
                    onChange={(value: any) => setData('tanggalLahirWali', value)}
                    required
                    onError={errors?.tanggalLahirWali}
                    disabled={isWaliSamaOrtu}
                  />
                </div>
              </div>
            )}

            {/* Step 4: DATA PERIODIK */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Periodik
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="textarea"
                    name="alamat"
                    label="Alamat Lengkap"
                    value={data.alamat}
                    onChange={(value: any) => setData('alamat', value)}
                    placeholder="Jalan, Gang, Nomor Rumah"
                    required
                    onError={errors?.alamat}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <UniversalInput
                      type="number"
                      name="rt"
                      label="RT"
                      value={data.rt}
                      onChange={(value: any) => setData('rt', value)}
                      placeholder="000"
                      required
                      onError={errors?.rt}
                      noSpace
                    />

                    <UniversalInput
                      type="number"
                      name="rw"
                      label="RW"
                      value={data.rw}
                      onChange={(value: any) => setData('rw', value)}
                      placeholder="000"
                      required
                      onError={errors?.rw}
                      noSpace
                    />
                  </div>

                  <UniversalInput
                    type="text"
                    name="dusun"
                    label="Dusun"
                    value={data.dusun}
                    onChange={(value: any) => setData('dusun', value)}
                    placeholder="Nama dusun"
                    onError={errors?.dusun}
                  />

                  <UniversalInput
                    type="text"
                    name="kelurahan"
                    label="Kelurahan"
                    value={data.kelurahan}
                    onChange={(value: any) => setData('kelurahan', value)}
                    placeholder="Nama kelurahan"
                    required
                    onError={errors?.kelurahan}
                  />

                  <UniversalInput
                    type="text"
                    name="kecamatan"
                    label="Kecamatan"
                    value={data.kecamatan}
                    onChange={(value: any) => setData('kecamatan', value)}
                    placeholder="Nama kecamatan"
                    required
                    onError={errors?.kecamatan}
                  />

                  <UniversalInput
                    type="number"
                    name="kodePos"
                    label="Kode Pos"
                    value={data.kodePos}
                    onChange={(value: any) => setData('kodePos', value)}
                    placeholder="00000"
                    required
                    onError={errors?.kodePos}
                    noSpace
                  />

                  <UniversalInput
                    type="tel"
                    name="noTelepon"
                    label="No Telepon/HP"
                    value={data.noTelepon}
                    onChange={(value: any) => setData('noTelepon', value)}
                    placeholder="08xxxxxxxxxx"
                    required
                    onError={errors?.noTelepon}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="anakKe"
                    label="Anak Ke"
                    value={data.anakKe}
                    onChange={(value: any) => setData('anakKe', value)}
                    placeholder="1"
                    min={1}
                    required
                    onError={errors?.anakKe}
                  />

                  <UniversalInput
                    type="number"
                    name="jumlahSaudara"
                    label="Jumlah Saudara"
                    value={data.jumlahSaudara}
                    onChange={(value: any) => setData('jumlahSaudara', value)}
                    placeholder="0"
                    min={0}
                    required
                    onError={errors?.jumlahSaudara}
                  />

                  <UniversalInput
                    type="text"
                    name="hobby"
                    label="Hobby"
                    value={data.hobby}
                    onChange={(value: any) => setData('hobby', value)}
                    placeholder="Hobby siswa"
                    onError={errors?.hobby}
                  />

                  <UniversalInput
                    type="text"
                    name="citacita"
                    label="Cita-cita"
                    value={data.citacita}
                    onChange={(value: any) => setData('citacita', value)}
                    placeholder="Cita-cita siswa"
                    onError={errors?.citacita}
                  />
                </div>
              </div>
            )}

            {/* Step 5: DATA KESEHATAN */}
            {step === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Kesehatan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="number"
                    name="beratBadan"
                    label="Berat Badan (kg)"
                    value={data.beratBadan}
                    onChange={(value: any) => setData('beratBadan', value)}
                    placeholder="Berat badan dalam kg"
                    required
                    onError={errors?.beratBadan}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="tinggiBadan"
                    label="Tinggi Badan (cm)"
                    value={data.tinggiBadan}
                    onChange={(value: any) => setData('tinggiBadan', value)}
                    placeholder="Tinggi badan dalam cm"
                    required
                    onError={errors?.tinggiBadan}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="lingkarKepala"
                    label="Lingkar Kepala (cm)"
                    value={data.lingkarKepala}
                    onChange={(value: any) => setData('lingkarKepala', value)}
                    placeholder="Lingkar kepala dalam cm"
                    onError={errors?.lingkarKepala}
                    noSpace
                  />

                  {/* KESEJAHTERAAN - ditempatkan di step kesehatan */}
                  <UniversalInput
                    type="select"
                    name="penerimaKip"
                    label="Penerima KIP"
                    value={data.penerimaKip}
                    onChange={(value: any) => setData('penerimaKip', value)}
                    options={[
                      { value: 'Iya', label: 'Iya' },
                      { value: 'Tidak', label: 'Tidak' },
                    ]}
                    required
                    onError={errors?.penerimaKip}
                  />

                  <UniversalInput
                    type="select"
                    name="jenisKesejahteraan"
                    label="Jenis Kesejahteraan"
                    value={data.jenisKesejahteraan}
                    onChange={(value: any) => setData('jenisKesejahteraan', value)}
                    options={[
                      { value: 'PROGRAM KELUARGA HARAPAN', label: 'Program Keluarga Harapan' },
                      { value: 'KARTU INDONESIA PINTAR', label: 'Kartu Indonesia Pintar' },
                      { value: 'KARTU PERLINDUNGAN SOSIAL', label: 'Kartu Perlindungan Sosial' },
                      { value: 'KARTU KELUARGA SEJAHTERA', label: 'Kartu Keluarga Sejahtera' },
                      { value: 'KARTU KESEHATAN', label: 'Kartu Kesehatan' },
                      { value: 'TIDAK ADA', label: 'Tidak Ada' },
                    ]}
                    required
                    onError={errors?.jenisKesejahteraan}
                  />

                  <UniversalInput
                    type="number"
                    name="nomorKartu"
                    label="Nomor Kartu"
                    value={data.nomorKartu}
                    onChange={(value: any) => setData('nomorKartu', value)}
                    placeholder="Nomor kartu kesejahteraan"
                    onError={errors?.nomorKartu}
                    noSpace
                    disabled={data.jenisKesejahteraan == 'TIDAK ADA'}
                  />

                  <UniversalInput
                    type="text"
                    name="namaDiKartu"
                    label="Nama di Kartu"
                    value={data.namaDiKartu}
                    onChange={(value: any) => setData('namaDiKartu', value)}
                    placeholder="Nama sesuai kartu"
                    onError={errors?.namaDiKartu}
                    uppercase
                    disabled={data.jenisKesejahteraan == 'TIDAK ADA'}
                  />

                  <UniversalInput
                    type="number"
                    name="noKps"
                    label="No KPS"
                    value={data.noKps}
                    onChange={(value: any) => setData('noKps', value)}
                    placeholder="Nomor Kartu Perlindungan Sosial"
                    onError={errors?.noKps}
                    noSpace
                  />
                </div>
              </div>
            )}

            {/* Step 6: DATA REGISTRASI */}
            {step === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Data Registrasi
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UniversalInput
                    type="email"
                    name="email"
                    label="Email"
                    value={data.email}
                    onChange={(value: any) => setData('email', value)}
                    placeholder="Email untuk masuk akun"
                    onError={errors?.email}
                  />
                  <UniversalInput
                    type="password"
                    name="password"
                    label="Password"
                    value={data.password}
                    onChange={(value: any) => setData('password', value)}
                    placeholder="Password untuk masuk akun"
                    onError={errors?.password}
                  />
                  <UniversalInput
                    type="select"
                    name="jenisPendaftaran"
                    label="Jenis Pendaftaran"
                    value={data.jenisPendaftaran}
                    onChange={(value: any) => setData('jenisPendaftaran', value)}
                    options={[
                      { value: 'SISWA BARU', label: 'Siswa Baru' },
                      { value: 'PINDAHAN', label: 'Pindahan' },
                      { value: 'KEMBALI BERSEKOLAH', label: 'Kembali Bersekolah' },
                    ]}
                    required
                    onError={errors?.jenisPendaftaran}
                  />

                  <UniversalInput
                    type="text"
                    name="sekolahAsal"
                    label="Sekolah Asal"
                    value={data.sekolahAsal}
                    onChange={(value: any) => setData('sekolahAsal', value)}
                    placeholder="Nama sekolah sebelumnya"
                    required
                    onError={errors?.sekolahAsal}
                  />

                  <UniversalInput
                    type="number"
                    name="npsn"
                    label="NPSN Sekolah Asal"
                    value={data.npsn}
                    onChange={(value: any) => setData('npsn', value)}
                    placeholder="8 digit NPSN"
                    onError={errors?.npsn}
                    noSpace
                  />

                  <UniversalInput
                    type="text"
                    name="sekolahAsalPindahan"
                    label="Sekolah Asal Pindahan"
                    value={data.sekolahAsalPindahan}
                    onChange={(value: any) => setData('sekolahAsalPindahan', value)}
                    placeholder="Nama sekolah asal pindahan"
                    onError={errors?.sekolahAsalPindahan}
                    disabled={data.jenisPendaftaran == 'SISWA BARU'}
                  />

                  <UniversalInput
                    type="text"
                    name="suratKeteranganPindah"
                    label="Surat Keterangan Pindah"
                    value={data.suratKeteranganPindah}
                    onChange={(value: any) => setData('suratKeteranganPindah', value)}
                    placeholder="Nomor surat keterangan pindah"
                    onError={errors?.suratKeteranganPindah}
                    disabled={data.jenisPendaftaran == 'SISWA BARU'}
                  />

                  <UniversalInput
                    type="number"
                    name="jarakSekolah"
                    label="Jarak ke Sekolah (km)"
                    value={data.jarakSekolah}
                    onChange={(value: any) => setData('jarakSekolah', value)}
                    placeholder="Jarak dari rumah ke sekolah"
                    onError={errors?.jarakSekolah}
                    noSpace
                  />

                  <UniversalInput
                    type="number"
                    name="waktuTempuh"
                    label="Waktu Tempuh (menit)"
                    value={data.waktuTempuh}
                    onChange={(value: any) => setData('waktuTempuh', value)}
                    placeholder="Waktu tempuh ke sekolah"
                    onError={errors?.waktuTempuh}
                    noSpace
                  />

                  <UniversalInput
                    type="select"
                    name="jenisTinggal"
                    label="Jenis Tinggal"
                    value={data.jenisTinggal}
                    onChange={(value: any) => setData('jenisTinggal', value)}
                    options={[
                      { value: 'Milik Pribadi', label: 'Milik Pribadi' },
                      { value: 'Bersama Orang Tua', label: 'Bersama Orang Tua' },
                      { value: 'Sewa / Kontrak', label: 'Sewa / Kontrak' },
                      { value: 'Asrama', label: 'Asrama' },
                      { value: 'Milik Keluarga', label: 'Milik Keluarga' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                    onError={errors?.jenisTinggal}
                  />

                  <UniversalInput
                    type="text"
                    name="transportasi"
                    label="Transportasi ke Sekolah"
                    value={data.transportasi}
                    onChange={(value: any) => setData('transportasi', value)}
                    placeholder="Jenis transportasi yang digunakan"
                    onError={errors?.transportasi}
                  />
                </div>
              </div>
            )}

            {/* Step 7: UPLOAD DOKUMEN */}
            {step === 7 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Upload Dokumen
                </h2>

                <div className="space-y-6">
                  <UniversalInput
                    type="file"
                    name="fileAkta"
                    label="Akta Kelahiran"
                    onChange={(value: any) => setData('fileAkta', value?.[0] || null)}
                    accept="image/*,.pdf"
                    required
                    onError={errors?.fileAkta}
                  />

                  <UniversalInput
                    type="file"
                    name="fileKk"
                    label="Kartu Keluarga (KK)"
                    onChange={(value: any) => setData('fileKk', value?.[0] || null)}
                    accept="image/*,.pdf"
                    required
                    onError={errors?.fileKk}
                  />

                  <UniversalInput
                    type="file"
                    name="fileIjazah"
                    label="Ijazah Terakhir"
                    onChange={(value: any) => setData('fileIjazah', value?.[0] || null)}
                    accept="image/*,.pdf"
                    required
                    onError={errors?.fileIjazah}
                  />

                  <UniversalInput
                    type="file"
                    name="fileFoto"
                    label="Pas Foto 3x4"
                    onChange={(value: any) => setData('fileFoto', value?.[0] || null)}
                    accept="image/*"
                    required
                    onError={errors?.fileFoto}
                  />

                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                      <strong>Format file:</strong> JPG, PNG, atau PDF (maks. 10MB)
                      <br />
                      <strong>Foto:</strong> Latar belakang merah, berpakaian sopan
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 8: KONFIRMASI */}
            {step === 8 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-6">
                  Konfirmasi Data
                </h2>

                <div className="space-y-4">
                  {/* Data Calon Siswa */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-3">
                      Data Calon Siswa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p>
                        <strong>NISN:</strong> {data.nisn}
                      </p>
                      <p>
                        <strong>Nama:</strong> {data.nama}
                      </p>
                      <p>
                        <strong>Jenis Kelamin:</strong> {data.jenisKelamin}
                      </p>
                      <p>
                        <strong>NIK:</strong> {data.nik}
                      </p>
                      <p>
                        <strong>No KK:</strong> {data.noKk}
                      </p>
                      <p>
                        <strong>Tempat/Tgl Lahir:</strong> {data.tempatLahir}, {data.tanggalLahir}
                      </p>
                      <p>
                        <strong>No Akta:</strong> {data.noAktaLahir}
                      </p>
                      <p>
                        <strong>Agama:</strong> {data.agama}
                      </p>
                      <p>
                        <strong>Kewarganegaraan:</strong> {data.kewarganegaraan}
                      </p>
                    </div>
                  </div>

                  {/* Data Orang Tua */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-3">
                      Data Orang Tua
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p>
                        <strong>Ayah:</strong> {data.namaAyah}
                      </p>
                      <p>
                        <strong>Ibu:</strong> {data.namaIbu}
                      </p>
                      <p>
                        <strong>NIK Ayah:</strong> {data.nikAyah}
                      </p>
                      <p>
                        <strong>NIK Ibu:</strong> {data.nikIbu}
                      </p>
                      <p>
                        <strong>Pendidikan Ayah:</strong> {data.pendidikanAyah}
                      </p>
                      <p>
                        <strong>Pendidikan Ibu:</strong> {data.pendidikanIbu}
                      </p>
                      <p>
                        <strong>Pekerjaan Ayah:</strong> {data.pekerjaanAyah}
                      </p>
                      <p>
                        <strong>Pekerjaan Ibu:</strong> {data.pekerjaanIbu}
                      </p>
                      <p>
                        <strong>No HP:</strong> {data.noHpOrtu}
                      </p>
                    </div>
                  </div>

                  {/* Data Wali */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-3">
                      Data Wali
                    </h3>
                    <div className="text-sm">
                      <p>
                        <strong>Nama Wali:</strong> {data.namaWali}
                      </p>
                      <p>
                        <strong>NIK Wali:</strong> {data.nikWali}
                      </p>
                      <p>
                        <strong>Pekerjaan Wali:</strong> {data.pekerjaanWali}
                      </p>
                      <p>
                        <strong>Hubungan:</strong> {data.hubunganDenganWali}
                      </p>
                    </div>
                  </div>

                  {/* Data Periodik & Kesehatan */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-3">
                      Data Periodik & Kesehatan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <p>
                        <strong>Alamat:</strong> {data.alamat}
                      </p>
                      <p>
                        <strong>RT/RW:</strong> {data.rt}/{data.rw}
                      </p>
                      <p>
                        <strong>Kelurahan:</strong> {data.kelurahan}, Kec. {data.kecamatan}
                      </p>
                      <p>
                        <strong>Kode Pos:</strong> {data.kodePos}
                      </p>
                      <p>
                        <strong>Anak Ke:</strong> {data.anakKe}
                      </p>
                      <p>
                        <strong>Jumlah Saudara:</strong> {data.jumlahSaudara}
                      </p>
                      <p>
                        <strong>Berat/Tinggi:</strong> {data.beratBadan} kg / {data.tinggiBadan} cm
                      </p>
                      <p>
                        <strong>Hobby:</strong> {data.hobby}
                      </p>
                      <p>
                        <strong>Cita-cita:</strong> {data.citacita}
                      </p>
                      <p>
                        <strong>Penerima KIP:</strong> {data.penerimaKip}
                      </p>
                    </div>
                  </div>

                  {/* Data Registrasi */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-3">
                      Data Registrasi
                    </h3>
                    <div className="text-sm">
                      <p>
                        <strong>Jenis Pendaftaran:</strong> {data.jenisPendaftaran}
                      </p>
                      <p>
                        <strong>Sekolah Asal:</strong> {data.sekolahAsal}
                      </p>
                      <p>
                        <strong>NPSN:</strong> {data.npsn}
                      </p>
                      <p>
                        <strong>Jarak Sekolah:</strong> {data.jarakSekolah} km
                      </p>
                      <p>
                        <strong>Waktu Tempuh:</strong> {data.waktuTempuh} menit
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      <strong>Periksa kembali data Anda!</strong> Pastikan semua data yang
                      dimasukkan sudah benar dan lengkap. Data yang sudah dikirim tidak dapat
                      diubah.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </button>

              {step < steps.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Lanjut
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pendaftaran'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
