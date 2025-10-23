import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'

export default function Form({ initialValues, onSubmit, submitLabel }: any) {
  const { data, setData, processing, errors } = useForm(
    initialValues || {
      nama: '',
      jenis: '',
      deskripsi: '',
      lokasi: '',
      tanggal_pelaksanaan: '',
      status: 'draft',
      dokumentasi: '',
    }
  )

  const jenisOptions = [
    'ekstrakurikuler',
    'studi_tour',
    'lomba',
    'prestasi',
    'bakti_sosial',
    'upacara',
    'lainnya',
  ].map((v) => ({ label: v.replace('_', ' ').toUpperCase(), value: v }))

  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UniversalInput
        type="text"
        name="nama"
        label="Nama Aktivitas"
        value={data.nama}
        onChange={(v: string) => setData('nama', v)}
        required
      />
      <UniversalInput
        type="select"
        name="jenis"
        label="Jenis Aktivitas"
        value={data.jenis}
        onChange={(v: any) => setData('jenis', v)}
        options={jenisOptions}
        required
      />
      <UniversalInput
        type="textarea"
        name="deskripsi"
        label="Deskripsi"
        value={data.deskripsi}
        onChange={(v: string) => setData('deskripsi', v)}
        required
      />
      <UniversalInput
        type="text"
        name="lokasi"
        label="Lokasi"
        value={data.lokasi}
        onChange={(v: string) => setData('lokasi', v)}
        required
      />
      <UniversalInput
        type="date"
        name="tanggal_pelaksanaan"
        label="Tanggal Pelaksanaan"
        value={data.tanggal_pelaksanaan}
        onChange={(v: string) => setData('tanggal_pelaksanaan', v)}
        required
      />
      <UniversalInput
        type="select"
        name="status"
        label="Status"
        value={data.status}
        onChange={(v: any) => setData('status', v)}
        options={statusOptions}
        required
      />
      <UniversalInput
        type="file"
        name="dokumentasi"
        label="Dokumentasi"
        onChange={(files: FileList) => setData('dokumentasi', files[0])}
        accept="image/*"
      />
      {data.dokumentasi && typeof data.dokumentasi === 'string' && (
        <img
          src={`/storage/aktivitas/${data.dokumentasi}`}
          alt="Aktivitas"
          className="w-32 h-32 rounded-md mt-2"
        />
      )}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => history.back()}
          className="px-6 py-3 bg-gray-500 text-white rounded-md"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={processing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          {processing ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
