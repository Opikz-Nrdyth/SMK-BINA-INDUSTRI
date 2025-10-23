import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { Mapel } from './types'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: Mapel
  onSubmit: (data: Mapel) => void
  submitLabel: string
  dark?: boolean
  guruOptions?: options[]
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  guruOptions,
}: Props) {
  const { data, setData, processing, errors } = useForm<Mapel>(
    initialValues || {
      namaMataPelajaran: '',
      jenjang: '',
      guruAmpu: [],
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="text"
          name="namaMataPelajaran"
          label="Nama Mata Pelajaran"
          value={data.namaMataPelajaran}
          onChange={(v: any) => setData('namaMataPelajaran', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="jenjang"
          label="Jenjang"
          value={data.jenjang}
          onChange={(v: any) => setData('jenjang', v)}
          options={[
            { label: 'Kelas 10', value: '10' },
            { label: 'Kelas 11', value: '11' },
            { label: 'Kelas 12', value: '12' },
          ]}
          required
          dark={dark}
        />

        <div className="md:col-span-2">
          <UniversalInput
            type="multiselect"
            name="guruAmpu"
            label="Guru Pengampu"
            value={data.guruAmpu}
            onChange={(v: any) => setData('guruAmpu', v)}
            options={guruOptions}
            required
            dark={dark}
          />
        </div>
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
