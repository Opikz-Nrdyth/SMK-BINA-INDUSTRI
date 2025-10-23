import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'

export default function Form({ initialValues, onSubmit, submitLabel }: any) {
  const { data, setData, processing } = useForm(
    initialValues || {
      judul: '',
      deskripsi: '',
      tipe: 'banner',
      tautan: '',
      aktif: false,
      tanggal_mulai: '',
      tanggal_selesai: '',
      gambar: undefined,
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // jika ada file, biarkan useForm membuat FormData otomatis
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <UniversalInput
        type="text"
        name="judul"
        label="Judul Iklan"
        value={data.judul}
        onChange={(v: any) => setData('judul', v)}
        required
      />
      <UniversalInput
        type="textarea"
        name="deskripsi"
        label="Deskripsi"
        value={data.deskripsi || ''}
        onChange={(v: any) => setData('deskripsi', v)}
      />
      <UniversalInput
        type="select"
        name="tipe"
        label="Tipe"
        value={data.tipe}
        onChange={(v: any) => setData('tipe', v)}
        options={[
          { label: 'Banner', value: 'banner' },
          { label: 'Popup', value: 'popup' },
        ]}
        required
      />
      <UniversalInput
        type="text"
        name="tautan"
        label="Tautan (opsional)"
        value={data.tautan || ''}
        onChange={(v: any) => setData('tautan', v)}
        placeholder="https://example.com"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="date"
          name="tanggal_mulai"
          label="Tanggal Mulai (opsional)"
          value={data.tanggal_mulai || ''}
          onChange={(v: any) => setData('tanggal_mulai', v)}
        />
        <UniversalInput
          type="date"
          name="tanggal_selesai"
          label="Tanggal Selesai (opsional)"
          value={data.tanggal_selesai || ''}
          onChange={(v: any) => setData('tanggal_selesai', v)}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={data.aktif}
          onChange={(e) => setData('aktif', e.target.checked)}
          id="aktif"
        />
        <label htmlFor="aktif">Aktif</label>
      </div>

      <UniversalInput
        type="file"
        name="gambar"
        label="Gambar (opsional)"
        onChange={(files: FileList) => {
          const f = files?.[0]
          if (f) setData('gambar', f)
        }}
        accept="image/*"
      />

      {data.gambar && typeof data.gambar === 'string' && (
        <img
          src={`/storage/ads/${data.gambar}`}
          alt="current"
          className="w-40 h-24 object-cover rounded-md mt-2"
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
          className="px-6 py-3 bg-green-600 text-white rounded-md"
        >
          {processing ? 'Menyimpan...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
