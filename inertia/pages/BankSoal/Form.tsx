// resources/js/Pages/BankSoal/Form.tsx
import React from 'react'
import { Link, useForm, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { formatDateTimeLocal, FormInputDateFormat } from '~/Components/FormatWaktu'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { BankSoalFormData, JurusanOption, MapelOption, UserOption } from './types'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: BankSoalFormData & { id?: string }
  onSubmit: (data: BankSoalFormData) => void
  submitLabel: string
  jurusanList: JurusanOption[]
  dark?: boolean
  guruOptions: options[]
  mapelOptions: options[]
}

export default function BankSoalForm({
  initialValues,
  onSubmit,
  submitLabel,
  jurusanList,
  dark = false,
  guruOptions,
  mapelOptions,
}: Props) {
  const { data, setData, processing, errors } = useForm<BankSoalFormData & { id?: string }>(
    initialValues || {
      namaUjian: '',
      jenjang: '',
      jurusan: [],
      mapel: '',
      jenisUjian: 'Ujian Sekolah',
      penulis: [],
      waktu: '',
      kode: '',
      tanggalUjian: '',
      soalFile: '',
    }
  )

  const props = usePage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedData: BankSoalFormData = {
      ...data,
      soalFile: '[]',
    }

    onSubmit(formattedData)
  }

  const jenjangOptions = [
    { value: '10', label: 'Kelas 10' },
    { value: '11', label: 'Kelas 11' },
    { value: '12', label: 'Kelas 12' },
  ]

  let jenisUjianOptions = [
    { value: 'PAS', label: 'PAS' },
    { value: 'PAT', label: 'PAT' },
    { value: 'Ujian Mandiri', label: 'Ujian Mandiri' },
  ]

  const waktuOptions = [
    { value: '30', label: '30 menit' },
    { value: '60', label: '60 menit' },
    { value: '90', label: '90 menit' },
    { value: '120', label: '120 menit' },
    { value: '150', label: '150 menit' },
    { value: '180', label: '180 menit' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informasi Ujian */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="text"
          name="namaUjian"
          label="Nama Ujian"
          value={data.namaUjian}
          onChange={(v: any) => setData('namaUjian', v)}
          required
          dark={dark}
          onError={errors.namaUjian}
        />

        <UniversalInput
          type="select"
          name="jenjang"
          label="Jenjang"
          value={data.jenjang}
          onChange={(v: any) => setData('jenjang', v)}
          options={jenjangOptions}
          required
          dark={dark}
          onError={errors.jenjang}
        />

        <UniversalInput
          type="select"
          name="mapel"
          label="Mata Pelajaran"
          value={data.mapel}
          onChange={(v: any) => setData('mapel', v)}
          options={mapelOptions}
          required
          dark={dark}
          onError={errors.mapel || errors.mapelId}
        />

        <UniversalInput
          type="select"
          name="jenisUjian"
          label="Jenis Ujian"
          value={data.jenisUjian}
          onChange={(v: any) => setData('jenisUjian', v)}
          options={jenisUjianOptions}
          required
          dark={dark}
          onError={errors.jenisUjian}
        />

        <UniversalInput
          type="select"
          name="waktu"
          label="Waktu Ujian"
          value={data.waktu}
          onChange={(v: any) => setData('waktu', v)}
          options={waktuOptions}
          required
          dark={dark}
          onError={errors.waktu}
        />

        <UniversalInput
          type="datetime-local"
          name="tanggalUjian"
          label="Tanggal Ujian"
          value={formatDateTimeLocal(data.tanggalUjian)}
          onChange={(v: any) => setData('tanggalUjian', v)}
          required
          dark={dark}
          onError={errors.tanggalUjian}
        />
        <UniversalInput
          type="text"
          name="kode"
          label="Kode Ujian"
          value={data.kode}
          onChange={(v: any) => setData('kode', v)}
          dark={dark}
          onError={errors.kode}
        />
      </div>

      {/* Jurusan (Multi Select) */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Jurusan <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {jurusanList.map((jurusan) => (
            <label key={jurusan.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={data.jurusan.includes(jurusan.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setData('jurusan', [...data.jurusan, jurusan.id])
                  } else {
                    setData(
                      'jurusan',
                      data.jurusan.filter((id) => id !== jurusan.id)
                    )
                  }
                }}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {jurusan.namaJurusan}
              </span>
            </label>
          ))}
        </div>
        {errors.jurusan && <p className="text-red-500 text-sm mt-1">{errors.jurusan}</p>}
      </div>

      <UniversalInput
        type="multiselect"
        name="penulis"
        label="Penulis"
        value={data.penulis}
        onChange={(v: any) => setData('penulis', v)}
        options={guruOptions}
        required
        dark={dark}
        onError={errors.tanggalUjian}
      />
      {/* Penulis (Multi Select) */}

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <Link
          href={String(props.pattern)}
          className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Batal
        </Link>
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

BankSoalForm.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
