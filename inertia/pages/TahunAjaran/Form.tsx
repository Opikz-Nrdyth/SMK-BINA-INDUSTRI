import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { TahunAjaran } from './types'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: TahunAjaran
  onSubmit: (data: TahunAjaran) => void
  submitLabel: string
  dark?: boolean
  userOptions?: options[]
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  userOptions,
}: Props) {
  const { data, setData, processing, errors } = useForm<TahunAjaran>(
    initialValues || {
      kodeTa: '',
      tahunAjaran: '',
      kepalaSekolah: '',
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
          name="kodeTa"
          label="Kode TA"
          value={data.kodeTa}
          onChange={(v: any) => setData('kodeTa', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="tahunAjaran"
          label="Tahun Ajaran"
          value={data.tahunAjaran}
          onChange={(v: any) => setData('tahunAjaran', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="kepalaSekolah"
          label="Kepala Sekolah"
          value={data.kepalaSekolah}
          onChange={(v: any) => setData('kepalaSekolah', v)}
          options={userOptions}
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
