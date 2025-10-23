import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Jurusan } from './types'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: Jurusan
  onSubmit: (data: Jurusan) => void
  submitLabel: string
  dark?: boolean
  kelasOption?: options[]
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  kelasOption,
}: Props) {
  const { data, setData, post, processing, errors } = useForm<Jurusan>(
    initialValues || {
      akreditasi: '',
      kelasId: [],
      kodeJurusan: '',
      namaJurusan: '',
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formattedData: Jurusan = {
      ...data,
    }
    onSubmit(formattedData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="text"
          uppercase
          noSpace
          name="kodeJurusan"
          label="Kode Jurusan"
          value={data.kodeJurusan}
          onChange={(v: any) => setData('kodeJurusan', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="namaJurusan"
          label="Nama Jurusan"
          value={data.namaJurusan}
          onChange={(v: any) => setData('namaJurusan', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="akreditasi"
          label="Akreditasi"
          value={data.akreditasi}
          onChange={(v: any) => setData('akreditasi', v)}
          options={[
            {
              label: 'A',
              value: 'A',
            },
            {
              label: 'B',
              value: 'B',
            },
            {
              label: 'C',
              value: 'C',
            },
            {
              label: 'D',
              value: 'D',
            },
          ]}
          required
          dark={dark}
        />

        <UniversalInput
          type="multiselect"
          name="kelasId"
          label="Data Kelas"
          value={data.kelasId}
          onChange={(v: any) => setData('kelasId', v)}
          options={kelasOption}
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
