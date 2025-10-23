import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Kelas } from './types'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: Kelas
  onSubmit: (data: Kelas) => void
  submitLabel: string
  dark?: boolean
  guruOption?: options[]
  siswaOption?: options[]
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  guruOption,
  siswaOption,
}: Props) {
  const { data, setData, post, processing, errors } = useForm<Kelas>(
    initialValues || {
      jenjang: '',
      namaKelas: '',
      siswa: [],
      guruPengampu: [],
      waliKelas: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedData: Kelas = {
      ...data,
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="number"
          name="jenjang"
          label="Jenjang"
          value={data.jenjang}
          onChange={(v: any) => setData('jenjang', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="namaKelas"
          uppercase
          noSpace
          label="Nama Kelas"
          value={data.namaKelas}
          onChange={(v: any) => setData('namaKelas', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="waliKelas"
          label="Wali Kelas"
          value={data.waliKelas}
          onChange={(v: any) => setData('waliKelas', v)}
          options={guruOption}
          required
          dark={dark}
        />

        <UniversalInput
          type="multiselect"
          name="guruPengampu"
          label="guruPengampu"
          value={data.guruPengampu}
          onChange={(v: any) => setData('guruPengampu', v)}
          options={guruOption}
          required
          dark={dark}
        />
        <UniversalInput
          type="multiselect"
          name="siswa"
          label="Siswa"
          value={data.siswa}
          onChange={(v: any) => setData('siswa', v)}
          options={siswaOption}
          required
          dark={dark}
        />
      </div>

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
