import React, { useState } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { StafFormData } from './types'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { FormInputDateFormat } from '~/Components/FormatWaktu'
import { useNotification } from '~/Components/NotificationAlert'

interface Props {
  initialValues?: StafFormData
  onSubmit: (data: StafFormData) => void
  submitLabel: string
  dark?: boolean
}

export default function Form({ initialValues, onSubmit, submitLabel, dark = false }: Props) {
  const { data, setData, post, processing, errors } = useForm<StafFormData>(
    initialValues || {
      user: { fullName: '', email: '', password: '', role: 'Staf', password_confirmation: '' },
      staf: {
        agama: '',
        alamat: '',
        departemen: '',
        gelarBelakang: '',
        gelarDepan: '',
        jabatan: '',
        jenisKelamin: '',
        nip: '',
        noTelepon: '',
        tanggalLahir: '',
        tempatLahir: '',
        fileFoto: '',
      },
    }
  )
  const [dualAccount, setDualAccount] = useState(false)

  const { props } = usePage() as any
  const { notify } = useNotification()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formatToDateTime = (date: string) => {
      if (!date) return ''
      return new Date(date).toISOString().slice(0, 19).replace('T', ' ')
    }

    const formattedData: StafFormData = {
      ...data,
      staf: {
        ...data.staf,
        tanggalLahir: formatToDateTime(data.staf.tanggalLahir),
      },
    }
    onSubmit(formattedData)
  }

  const cekUser = async () => {
    const pattern = props.pattern.split('/').filter((route: any) => route !== '')
    const url = `${pattern[0]}/${pattern[1]}`

    if (data.user.email) {
      try {
        const res = await fetch(`/${url}/${data.user.email}/cekStaf`)
        console.log(res)

        if (!res.ok) throw new Error('Gagal fetch data')
        const result = await res.json()
        if (result.status == 'ready') {
          setDualAccount(true)
          console.log(result.data)
          const resultData = result.data

          notify('Data Di Temukan', 'success')
          setData({
            user: {
              fullName: resultData?.fullName,
              email: resultData?.email,
              role: 'Staf',
              password: 'Bukan Password Asli',
              password_confirmation: 'Bukan Password Asli',
            },
            staf: {
              agama: resultData?.dataGuru?.agama,
              alamat: resultData?.dataGuru?.alamat,
              departemen: '',
              gelarBelakang: resultData?.dataGuru?.gelarBelakang,
              gelarDepan: resultData?.dataGuru?.gelarDepan,
              jabatan: '',
              jenisKelamin: resultData?.dataGuru?.jenisKelamin,
              nip: resultData?.dataGuru?.nip,
              noTelepon: resultData?.dataGuru?.noTelepon,
              tanggalLahir: resultData?.dataGuru?.tanggalLahir,
              tempatLahir: resultData?.dataGuru?.tempatLahir,
              fileFoto: resultData?.dataGuru?.fileFoto,
            },
          })
        } else {
          notify(result.message, 'error')
        }
      } catch (err) {
        notify('Data Tidak Di Temukan', 'error')
      }
    }
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
        <UniversalInput
          type="text"
          disabled={dualAccount}
          name="fullName"
          label="Nama Lengkap"
          value={data.user.fullName}
          onChange={(v: any) => setData('user', { ...data.user, fullName: v })}
          required
          dark={dark}
        />
        <div>
          <UniversalInput
            type="email"
            name="email"
            disabled={dualAccount}
            label="Email"
            value={data.user.email}
            onChange={(v: any) => setData('user', { ...data.user, email: v })}
            required
            dark={dark}
          />
          {data.user.email && (
            <button onClick={cekUser} type="button" className="text-purple-400 font-bold mt-1">
              Buat Data Staf dari Guru
            </button>
          )}
        </div>
        {!initialValues && (
          <>
            <UniversalInput
              type="password"
              disabled={dualAccount}
              name="password"
              label="Password"
              value={data.user.password}
              onChange={(v: any) => setData('user', { ...data.user, password: v })}
              required
              dark={dark}
            />
            <UniversalInput
              type="password"
              disabled={dualAccount}
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
        <UniversalInput
          type="text"
          name="nip"
          label="NIY"
          value={data.staf.nip}
          onChange={(v: any) => setData('staf', { ...data.staf, nip: v })}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="departemen"
          label="Departemen"
          value={data.staf.departemen}
          onChange={(v: any) => setData('staf', { ...data.staf, departemen: v })}
          required
          dark={dark}
          options={[
            {
              label: 'Staf Administrasi',
              value: 'Administrasi',
            },
            {
              label: 'Staf Keuangan',
              value: 'Keuangan',
            },
            {
              label: 'Staf Multimedia',
              value: 'Multimedia',
            },
          ]}
        />

        <UniversalInput
          type="text"
          name="jabatan"
          label="Jabatan"
          value={data.staf.jabatan}
          onChange={(v: any) => setData('staf', { ...data.staf, jabatan: v })}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="alamat"
          label="Alamat"
          value={data.staf.alamat}
          onChange={(v: any) => setData('staf', { ...data.staf, alamat: v })}
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="noTelepon"
          label="No. Telepon"
          value={data.staf.noTelepon}
          onChange={(v: any) => setData('staf', { ...data.staf, noTelepon: v })}
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="gelarDepan"
          label="Gelar Depan"
          value={data.staf.gelarDepan}
          onChange={(v: any) => setData('staf', { ...data.staf, gelarDepan: v })}
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="gelarBelakang"
          label="Gelar Belakang"
          value={data.staf.gelarBelakang}
          onChange={(v: any) => setData('staf', { ...data.staf, gelarBelakang: v })}
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="jenisKelamin"
          label="Jenis Kelamin"
          options={jkOptions}
          value={data.staf.jenisKelamin}
          onChange={(v: any) => setData('staf', { ...data.staf, jenisKelamin: v })}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="tempatLahir"
          label="Tempat Lahir"
          value={data.staf.tempatLahir}
          onChange={(v: any) => setData('staf', { ...data.staf, tempatLahir: v })}
          dark={dark}
        />

        <UniversalInput
          type="date"
          name="tanggalLahir"
          label="Tanggal Lahir"
          value={FormInputDateFormat(data.staf.tanggalLahir)}
          onChange={(v: any) => setData('staf', { ...data.staf, tanggalLahir: v })}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="agama"
          label="Agama"
          options={agamaOptions}
          value={data.staf.agama}
          onChange={(v: any) => setData('staf', { ...data.staf, agama: v })}
          required
          dark={dark}
        />
      </div>
      <UniversalInput
        type="file"
        name="fileFoto"
        label="Foto Profile"
        value={data.staf.fileFoto}
        onChange={(v: any) => setData('staf', { ...data.staf, fileFoto: v })}
        required
        dark={dark}
      />
      {data.staf.fileFoto && (
        <img src={`/${data.staf.fileFoto}`} className="w-40" alt={data.user.fullName} />
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
