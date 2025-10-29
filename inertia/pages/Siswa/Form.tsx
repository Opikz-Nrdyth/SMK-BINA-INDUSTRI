// resources/js/Pages/Siswa/Form.tsx
import React from 'react'
import { useForm } from '@inertiajs/react'

import { SiswaFormData, Wali } from './types'
import UniversalInput from '~/Components/UniversalInput'
import { FormInputDateFormat } from '~/Components/FormatWaktu'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface Props {
  initialValues?: SiswaFormData
  onSubmit: (data: SiswaFormData) => void
  submitLabel: string
  dark?: boolean
}

export default function SiswaForm({ initialValues, onSubmit, submitLabel, dark = false }: Props) {
  const { data, setData, post, processing, errors } = useForm<SiswaFormData>(
    initialValues || {
      user: { fullName: '', email: '', password: '', password_confirmation: '' },
      siswa: {
        nisn: '',
        nik: '',
        noAktaLahir: '',
        noKk: '',
        jenisKelamin: 'Laki-laki',
        tempatLahir: '',
        tanggalLahir: '',
        agama: 'Islam',
        kewarganegaraan: 'WNI',
        alamat: '',
        rt: '',
        rw: '',
        dusun: '',
        kelurahan: '',
        kecamatan: '',
        kodePos: '',
        jenisTinggal: '',
        transportasi: '',
        noTelepon: '',
        anakKe: '',
        jumlahSaudara: '',
        penerimaKip: 'Tidak',
        beratBadan: '',
        tinggiBadan: '',
        lingkarKepala: '',
        jarakSekolah: '',
        waktuTempuh: '',
        jenisKesejahteraan: 'TIDAK ADA',
        nomorKartu: '',
        namaDiKartu: '',
        jenisPendaftaran: 'SISWA BARU',
        sekolahAsal: '',
        npsn: '',
        sekolahAsalPindahan: '',
        suratKeteranganPindah: '',
        hobby: '',
        citacita: '',
        noKps: '',
        fileAkta: '',
        fileKk: '',
        fileIjazah: '',
        fileFoto: '',
      },
      walis: [],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formatToDateTime = (date: string) => {
      if (!date) return ''
      return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
    }

    const formattedData: SiswaFormData = {
      ...data,
      siswa: {
        ...data.siswa,
        tanggalLahir: formatToDateTime(data.siswa.tanggalLahir),
      },
      walis: data.walis.map((wali) => ({
        ...wali,
        tanggalLahir: formatToDateTime(wali.tanggalLahir),
      })),
    }
    onSubmit(formattedData)
  }

  function formatRupiah(value: string | number) {
    if (!value) return ''
    const number = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value
    if (isNaN(number)) return ''
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number)
  }

  function parseRupiah(value: string) {
    if (!value) return ''
    return value.replace(/\D/g, '')
  }

  const addWali = () => {
    setData('walis', [
      ...data.walis,
      { nik: '', nama: '', tanggalLahir: '', pendidikan: '', pekerjaan: '', penghasilan: '' },
    ])
  }

  const removeWali = (index: number) => {
    setData(
      'walis',
      data.walis.filter((_, i) => i !== index)
    )
  }

  const updateWali = (index: number, field: keyof Wali, value: string) => {
    const updated = [...data.walis]
    updated[index] = { ...updated[index], [field]: value }
    setData('walis', updated)
  }

  // Options untuk select inputs
  const agamaOptions = [
    { value: 'Islam', label: 'Islam' },
    { value: 'Kristen', label: 'Kristen' },
    { value: 'Katolik', label: 'Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Buddha', label: 'Buddha' },
    { value: 'Konghucu', label: 'Konghucu' },
  ]

  const jkOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ]

  const yaTidakOptions = [
    { value: 'Iya', label: 'Iya' },
    { value: 'Tidak', label: 'Tidak' },
  ]

  const kewarganegaraanOptions = [
    { value: 'WNI', label: 'WNI' },
    { value: 'WNA', label: 'WNA' },
  ]

  const jenisKesejahteraanOptions = [
    { value: 'PROGRAM KELUARGA HARAPAN', label: 'Program Keluarga Harapan' },
    { value: 'KARTU INDONESIA PINTAR', label: 'Kartu Indonesia Pintar' },
    { value: 'KARTU PERLINDUNGAN SOSIAL', label: 'Kartu Perlindungan Sosial' },
    { value: 'KARTU KELUARGA SEJAHTERA', label: 'Kartu Keluarga Sejahtera' },
    { value: 'KARTU KESEHATAN', label: 'Kartu Kesehatan' },
    { value: 'TIDAK ADA', label: 'Tidak Ada' },
  ]

  const jenisPendaftaranOptions = [
    { value: 'SISWA BARU', label: 'Siswa Baru' },
    { value: 'PINDAHAN', label: 'Pindahan' },
    { value: 'KEMBALI BERSEKOLAH', label: 'Kembali Bersekolah' },
  ]

  const jenisTinggalOptions = [
    { value: 'Milik Pribadi', label: 'Milik Pribadi' },
    { value: 'Bersama Orang Tua', label: 'Bersama Orang Tua' },
    { value: 'Sewa / Kontrak', label: 'Sewa / Kontrak' },
    { value: 'Asrama', label: 'Asrama' },
    { value: 'Milik Keluarga', label: 'Milik Keluarga' },
    { value: 'Lainnya', label: 'Lainnya' },
  ]

  const transportasiOptions = [
    { value: 'Jalan Kaki', label: 'Jalan Kaki' },
    { value: 'Sepeda', label: 'Sepeda' },
    { value: 'Sepeda Motor', label: 'Sepeda Motor' },
    { value: 'Mobil Pribadi', label: 'Mobil Pribadi' },
    { value: 'Angkutan Umum', label: 'Angkutan Umum' },
    { value: 'Jemputan Sekolah', label: 'Jemputan Sekolah' },
    { value: 'Lainnya', label: 'Lainnya' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* BLOK 1: DATA USER */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Akun</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="text"
            name="fullName"
            label="Nama Lengkap"
            value={data.user.fullName}
            onChange={(v: any) => setData('user', { ...data.user, fullName: v })}
            required
          />
          <UniversalInput
            type="email"
            name="email"
            label="Email"
            value={data.user.email}
            onChange={(v: any) => setData('user', { ...data.user, email: v })}
            required
          />
          {!initialValues && (
            <>
              <UniversalInput
                type="password"
                name="password"
                label="Password"
                value={data.user.password}
                onChange={(v: any) => setData('user', { ...data.user, password: v })}
                required
              />
              <UniversalInput
                type="password"
                name="password_confirmation"
                label="Konfirmasi Password"
                value={data.user.password_confirmation}
                onChange={(v: any) => setData('user', { ...data.user, password_confirmation: v })}
                required
              />
            </>
          )}
        </div>
      </div>

      {/* BLOK 2: IDENTITAS SISWA */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Identitas Siswa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="number"
            name="nisn"
            label="NISN"
            value={data.siswa.nisn}
            onChange={(v: any) => setData('siswa', { ...data.siswa, nisn: v })}
            required
          />
          <UniversalInput
            type="number"
            name="nik"
            label="NIK"
            value={data.siswa.nik}
            onChange={(v: any) => setData('siswa', { ...data.siswa, nik: v })}
          />
          <UniversalInput
            type="text"
            name="noAktaLahir"
            label="No Akta Lahir"
            value={data.siswa.noAktaLahir}
            onChange={(v: any) => setData('siswa', { ...data.siswa, noAktaLahir: v })}
            required
          />
          <UniversalInput
            type="number"
            name="noKk"
            label="No KK"
            value={data.siswa.noKk}
            onChange={(v: any) => setData('siswa', { ...data.siswa, noKk: v })}
          />
          <UniversalInput
            type="select"
            name="jenisKelamin"
            label="Jenis Kelamin"
            value={data.siswa.jenisKelamin}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jenisKelamin: v })}
            options={jkOptions}
            required
          />
          <UniversalInput
            type="select"
            name="agama"
            label="Agama"
            value={data.siswa.agama}
            onChange={(v: any) => setData('siswa', { ...data.siswa, agama: v })}
            options={agamaOptions}
            required
          />
          <UniversalInput
            type="select"
            name="kewarganegaraan"
            label="Kewarganegaraan"
            value={data.siswa.kewarganegaraan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, kewarganegaraan: v })}
            options={kewarganegaraanOptions}
            required
          />
        </div>
      </div>

      {/* BLOK 3: DATA KELAHIRAN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Kelahiran</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="text"
            name="tempatLahir"
            label="Tempat Lahir"
            value={data.siswa.tempatLahir}
            onChange={(v: any) => setData('siswa', { ...data.siswa, tempatLahir: v })}
            required
          />
          <UniversalInput
            type="date"
            name="tanggalLahir"
            label="Tanggal Lahir"
            value={FormInputDateFormat(data.siswa.tanggalLahir)}
            onChange={(v: any) => setData('siswa', { ...data.siswa, tanggalLahir: v })}
            required
          />
        </div>
      </div>

      {/* BLOK 4: ALAMAT */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Alamat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="textarea"
            name="alamat"
            label="Alamat Lengkap"
            value={data.siswa.alamat}
            onChange={(v: any) => setData('siswa', { ...data.siswa, alamat: v })}
            required
          />
          <UniversalInput
            type="text"
            name="dusun"
            label="Dusun"
            value={data.siswa.dusun}
            onChange={(v: any) => setData('siswa', { ...data.siswa, dusun: v })}
          />
          <UniversalInput
            type="number"
            name="rt"
            label="RT"
            value={data.siswa.rt}
            onChange={(v: any) => setData('siswa', { ...data.siswa, rt: v })}
            required
          />
          <UniversalInput
            type="number"
            name="rw"
            label="RW"
            value={data.siswa.rw}
            onChange={(v: any) => setData('siswa', { ...data.siswa, rw: v })}
            required
          />
          <UniversalInput
            type="text"
            name="kelurahan"
            label="Kelurahan"
            value={data.siswa.kelurahan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, kelurahan: v })}
          />
          <UniversalInput
            type="text"
            name="kecamatan"
            label="Kecamatan"
            value={data.siswa.kecamatan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, kecamatan: v })}
            required
          />
          <UniversalInput
            type="number"
            name="kodePos"
            label="Kode Pos"
            value={data.siswa.kodePos}
            onChange={(v: any) => setData('siswa', { ...data.siswa, kodePos: v })}
            required
          />
          <UniversalInput
            type="select"
            name="jenisTinggal"
            label="Jenis Tinggal"
            value={data.siswa.jenisTinggal}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jenisTinggal: v })}
            options={jenisTinggalOptions}
            required
          />
          <UniversalInput
            type="select"
            name="transportasi"
            label="Transportasi ke Sekolah"
            value={data.siswa.transportasi}
            onChange={(v: any) => setData('siswa', { ...data.siswa, transportasi: v })}
            options={transportasiOptions}
          />
        </div>
      </div>

      {/* BLOK 5: KONTAK & KELUARGA */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Kontak & Data Keluarga
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="number"
            name="noTelepon"
            label="No. Telepon"
            value={data.siswa.noTelepon}
            onChange={(v: any) => setData('siswa', { ...data.siswa, noTelepon: v })}
            required
          />
          <UniversalInput
            type="number"
            name="anakKe"
            label="Anak Ke"
            value={data.siswa.anakKe}
            onChange={(v: any) => setData('siswa', { ...data.siswa, anakKe: v })}
            required
          />
          <UniversalInput
            type="number"
            name="jumlahSaudara"
            label="Jumlah Saudara"
            value={data.siswa.jumlahSaudara}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jumlahSaudara: v })}
            required
          />
          <UniversalInput
            type="select"
            name="penerimaKip"
            label="Penerima KIP"
            value={data.siswa.penerimaKip}
            onChange={(v: any) => setData('siswa', { ...data.siswa, penerimaKip: v })}
            options={yaTidakOptions}
            required
          />
        </div>
      </div>

      {/* BLOK 6: DATA FISIK */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Fisik</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UniversalInput
            type="number"
            name="beratBadan"
            label="Berat Badan (kg)"
            value={data.siswa.beratBadan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, beratBadan: v })}
          />
          <UniversalInput
            type="number"
            name="tinggiBadan"
            label="Tinggi Badan (cm)"
            value={data.siswa.tinggiBadan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, tinggiBadan: v })}
          />
          <UniversalInput
            type="number"
            name="lingkarKepala"
            label="Lingkar Kepala (cm)"
            value={data.siswa.lingkarKepala}
            onChange={(v: any) => setData('siswa', { ...data.siswa, lingkarKepala: v })}
          />
        </div>
      </div>

      {/* BLOK 7: DATA SEKOLAH & JARAK */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Sekolah</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="select"
            name="jenisPendaftaran"
            label="Jenis Pendaftaran"
            value={data.siswa.jenisPendaftaran}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jenisPendaftaran: v })}
            options={jenisPendaftaranOptions}
            required
          />
          <UniversalInput
            type="text"
            name="sekolahAsal"
            label="Sekolah Asal"
            value={data.siswa.sekolahAsal}
            onChange={(v: any) => setData('siswa', { ...data.siswa, sekolahAsal: v })}
            required
          />
          <UniversalInput
            type="number"
            name="npsn"
            label="NPSN Sekolah Asal"
            value={data.siswa.npsn}
            onChange={(v: any) => setData('siswa', { ...data.siswa, npsn: v })}
          />
          <UniversalInput
            type="text"
            name="sekolahAsalPindahan"
            label="Sekolah Asal (Pindahan)"
            value={data.siswa.sekolahAsalPindahan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, sekolahAsalPindahan: v })}
          />
          <UniversalInput
            type="text"
            name="suratKeteranganPindah"
            label="Surat Keterangan Pindah"
            value={data.siswa.suratKeteranganPindah}
            onChange={(v: any) => setData('siswa', { ...data.siswa, suratKeteranganPindah: v })}
          />
          <UniversalInput
            type="number"
            name="jarakSekolah"
            label="Jarak Sekolah (km)"
            value={data.siswa.jarakSekolah}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jarakSekolah: v })}
          />
          <UniversalInput
            type="number"
            name="waktuTempuh"
            label="Waktu Tempuh (menit)"
            value={data.siswa.waktuTempuh}
            onChange={(v: any) => setData('siswa', { ...data.siswa, waktuTempuh: v })}
          />
        </div>
      </div>

      {/* BLOK 8: DATA KESEJAHTERAAN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Data Kesejahteraan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <UniversalInput
            type="select"
            name="jenisKesejahteraan"
            label="Jenis Kesejahteraan"
            value={data.siswa.jenisKesejahteraan}
            onChange={(v: any) => setData('siswa', { ...data.siswa, jenisKesejahteraan: v })}
            options={jenisKesejahteraanOptions}
            required
          />
          <UniversalInput
            type="number"
            name="nomorKartu"
            label="Nomor Kartu"
            value={data.siswa.nomorKartu}
            onChange={(v: any) => setData('siswa', { ...data.siswa, nomorKartu: v })}
          />
          <UniversalInput
            type="text"
            name="namaDiKartu"
            label="Nama di Kartu"
            value={data.siswa.namaDiKartu}
            onChange={(v: any) => setData('siswa', { ...data.siswa, namaDiKartu: v })}
          />
          <UniversalInput
            type="number"
            name="noKps"
            label="No. KPS"
            value={data.siswa.noKps}
            onChange={(v: any) => setData('siswa', { ...data.siswa, noKps: v })}
          />
        </div>
      </div>

      {/* BLOK 9: MINAT & BAKAT */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Minat & Bakat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="text"
            name="hobby"
            label="Hobby"
            value={data.siswa.hobby}
            onChange={(v: any) => setData('siswa', { ...data.siswa, hobby: v })}
          />
          <UniversalInput
            type="text"
            name="citacita"
            label="Cita-cita"
            value={data.siswa.citacita}
            onChange={(v: any) => setData('siswa', { ...data.siswa, citacita: v })}
          />
        </div>
      </div>

      {/* BLOK 10: UPLOAD DOKUMEN */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Dokumen</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="file"
            name="fileAkta"
            label="File Akta"
            value={data.siswa.fileAkta}
            onChange={(v: any) => setData('siswa', { ...data.siswa, fileAkta: v })}
          />
          <UniversalInput
            type="file"
            name="fileKk"
            label="File KK"
            value={data.siswa.fileKk}
            onChange={(v: any) => setData('siswa', { ...data.siswa, fileKk: v })}
          />
          <UniversalInput
            type="file"
            name="fileIjazah"
            label="File Ijazah"
            value={data.siswa.fileIjazah}
            onChange={(v: any) => setData('siswa', { ...data.siswa, fileIjazah: v })}
          />
          <UniversalInput
            type="file"
            name="fileFoto"
            label="File Foto"
            value={data.siswa.fileFoto}
            onChange={(v: any) => setData('siswa', { ...data.siswa, fileFoto: v })}
          />
        </div>
      </div>

      {/* BLOK 11: DATA WALI */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Wali</h2>
            <button
              type="button"
              onClick={addWali}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Tambah Wali
            </button>
          </div>

          {data.walis.map((wali, index) => (
            <div key={index} className="p-4 border rounded-lg dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Wali {index + 1}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UniversalInput
                  type="number"
                  name="nik"
                  label="NIK Wali"
                  value={wali.nik}
                  onChange={(v: any) => updateWali(index, 'nik', v)}
                  required
                />
                <UniversalInput
                  type="text"
                  name="nama"
                  label="Nama Wali"
                  value={wali.nama}
                  onChange={(v: any) => updateWali(index, 'nama', v)}
                  required
                />
                <UniversalInput
                  type="date"
                  name="tanggalLahir"
                  label="Tanggal Lahir Wali"
                  value={FormInputDateFormat(wali.tanggalLahir)}
                  onChange={(v: any) => updateWali(index, 'tanggalLahir', v)}
                  required
                />
                <UniversalInput
                  type="text"
                  name="pendidikan"
                  label="Pendidikan Wali"
                  value={wali.pendidikan}
                  onChange={(v: any) => updateWali(index, 'pendidikan', v)}
                  required
                />
                <UniversalInput
                  type="text"
                  name="pekerjaan"
                  label="Pekerjaan Wali"
                  value={wali.pekerjaan}
                  onChange={(v: any) => updateWali(index, 'pekerjaan', v)}
                  required
                />
                <UniversalInput
                  type="currency"
                  name="penghasilan"
                  label="Penghasilan Wali"
                  value={formatRupiah(String(wali.penghasilan)) || ''}
                  onChange={(v: any) => updateWali(index, 'penghasilan', parseRupiah(v))}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeWali(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Hapus Wali
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

SiswaForm.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
