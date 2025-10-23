import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { FormInputDateFormat } from '~/Components/FormatWaktu'
import { GuruFormData } from './types'

interface Props {
  initialValues?: GuruFormData
  onSubmit: (data: GuruFormData) => void
  submitLabel: string
  dark?: boolean
}

export default function Form({ initialValues, onSubmit, submitLabel, dark = false }: Props) {
  const { data, setData, post, processing, errors } = useForm<GuruFormData>(
    initialValues || {
      user: { fullName: '', email: '', role: 'Guru', password: '', password_confirmation: '' },
      guru: {
        agama: '',
        alamat: '',
        gelarBelakang: '',
        gelarDepan: '',
        jenisKelamin: '',
        nip: '',
        noTelepon: '',
        tanggalLahir: '',
        tempatLahir: '',
        fileFoto: '',
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formatToDateTime = (date: string) => {
      if (!date) return ''
      return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
    }

    const formattedData: GuruFormData = {
      ...data,
      guru: {
        ...data.guru,
        tanggalLahir: formatToDateTime(data.guru.tanggalLahir),
      },
    }
    onSubmit(formattedData)
  }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Wajib */}
        <UniversalInput
          type="text"
          name="fullName"
          label="Nama Lengkap"
          value={data.user.fullName}
          onChange={(v: any) => setData('user', { ...data.user, fullName: v })}
          required
          dark={dark}
        />
        <UniversalInput
          type="email"
          name="email"
          label="Email"
          value={data.user.email}
          onChange={(v: any) => setData('user', { ...data.user, email: v })}
          required
          dark={dark}
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
              dark={dark}
            />
            <UniversalInput
              type="password"
              name="password_confirmation"
              label="Konfirmasi Password"
              value={data.user.password_confirmation}
              onChange={(v: any) => setData('user', { ...data.user, password_confirmation: v })}
              required
              dark={dark}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guru Wajib */}
        <UniversalInput
          type="text"
          name="nip"
          label="NIP"
          value={data.guru.nip}
          onChange={(v: any) => setData('guru', { ...data.guru, nip: v })}
          required
          dark={dark}
        />
        <UniversalInput
          type="select"
          name="jenisKelamin"
          label="Jenis Kelamin"
          options={jkOptions}
          value={data.guru.jenisKelamin}
          onChange={(v: any) => setData('guru', { ...data.guru, jenisKelamin: v })}
          required
          dark={dark}
        />
        <UniversalInput
          type="select"
          name="agama"
          label="Agama"
          options={agamaOptions}
          value={data.guru.agama}
          onChange={(v: any) => setData('guru', { ...data.guru, agama: v })}
          required
          dark={dark}
        />

        {/* Blok Nama + Gelar */}
        <UniversalInput
          type="text"
          name="gelarDepan"
          label="Gelar Depan"
          value={data.guru.gelarDepan}
          onChange={(v: any) => setData('guru', { ...data.guru, gelarDepan: v })}
          dark={dark}
        />
        <UniversalInput
          type="text"
          name="gelarBelakang"
          label="Gelar Belakang"
          value={data.guru.gelarBelakang}
          onChange={(v: any) => setData('guru', { ...data.guru, gelarBelakang: v })}
          dark={dark}
        />

        {/* Blok Tempat Lahir + Tanggal Lahir */}
        <UniversalInput
          type="text"
          name="tempatLahir"
          label="Tempat Lahir"
          value={data.guru.tempatLahir}
          onChange={(v: any) => setData('guru', { ...data.guru, tempatLahir: v })}
          dark={dark}
        />
        <UniversalInput
          type="date"
          name="tanggalLahir"
          label="Tanggal Lahir"
          value={FormInputDateFormat(data.guru.tanggalLahir)}
          onChange={(v: any) => setData('guru', { ...data.guru, tanggalLahir: v })}
          required
          dark={dark}
        />

        {/* Data opsional lain */}
        <UniversalInput
          type="text"
          name="alamat"
          label="Alamat"
          value={data.guru.alamat}
          onChange={(v: any) => setData('guru', { ...data.guru, alamat: v })}
          dark={dark}
        />
        <UniversalInput
          type="text"
          name="noTelepon"
          label="No. Telepon"
          value={data.guru.noTelepon}
          onChange={(v: any) => setData('guru', { ...data.guru, noTelepon: v })}
          dark={dark}
        />
      </div>
      <UniversalInput
        type="file"
        name="fileFoto"
        label="Foto Profile"
        value={data.guru.fileFoto}
        onChange={(v: any) => setData('guru', { ...data.guru, fileFoto: v })}
        required
        dark={dark}
      />
      {data.guru.fileFoto && (
        <img src={`/${data.guru.fileFoto}`} className="w-40" alt={data.user.fullName} />
      )}

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

Form.layout = (page: any) => <SuperAdminLayout>{page}</SuperAdminLayout>
