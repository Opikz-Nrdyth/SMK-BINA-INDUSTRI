import React from 'react'
import { useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { Blog } from './types'

interface Props {
  initialValues?: Blog
  onSubmit: (data: Blog) => void
  submitLabel: string
  dark?: boolean
}

export default function Form({ initialValues, onSubmit, submitLabel, dark = false }: Props) {
  const { data, setData, processing, errors } = useForm<Blog>(
    initialValues || {
      judul: '',
      slug: '',
      konten: '',
      ringkasan: '',
      thumbnail: '',
      status: 'draft',
      kategori: '',
      tags: [],
    }
  )

  const statusOptions = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ]

  const kategoriOptions = [
    { label: 'Teknologi', value: 'teknologi' },
    { label: 'Pendidikan', value: 'pendidikan' },
    { label: 'Umum', value: 'umum' },
    { label: 'Berita', value: 'berita' },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const handleJudulChange = (value: string) => {
    setData('judul', value)
    // Auto-generate slug
    if (!initialValues?.slug) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      setData('slug', slug)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <UniversalInput
          type="text"
          name="judul"
          label="Judul Blog"
          value={data.judul}
          onChange={handleJudulChange}
          required
          dark={dark}
        />

        <UniversalInput
          type="text"
          name="slug"
          label="Slug (URL)"
          value={data.slug}
          onChange={(v: any) => setData('slug', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="textarea"
          name="ringkasan"
          label="Ringkasan"
          value={data.ringkasan || ''}
          onChange={(v: any) => setData('ringkasan', v)}
          dark={dark}
        />

        <UniversalInput
          type="richtext"
          name="konten"
          label="Konten"
          value={data.konten}
          onChange={(v: any) => setData('konten', v)}
          required
          dark={dark}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="select"
            name="status"
            label="Status"
            value={data.status}
            onChange={(v: any) => setData('status', v)}
            options={statusOptions}
            required
            dark={dark}
          />

          <UniversalInput
            type="select"
            name="kategori"
            label="Kategori"
            value={data.kategori || ''}
            onChange={(v: any) => setData('kategori', v)}
            options={kategoriOptions}
            dark={dark}
          />
        </div>

        <UniversalInput
          type="file"
          name="thumbnail"
          label="Thumbnail"
          value={data.thumbnail}
          onChange={(files: FileList) => {
            // Handle file upload - file akan dikirim sebagai FormData
            setData('thumbnail', files[0])
          }}
          accept="image/jpeg,image/jpg,image/png,image/webp"
          dark={dark}
        />

        {data.thumbnail && typeof data.thumbnail === 'string' && (
          <div className="mt-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Thumbnail Saat Ini:</p>
            <img
              src={`/staf/uploads/blogs/${data.thumbnail}`}
              alt="Current thumbnail"
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
        )}

        <UniversalInput
          type="text"
          name="tags"
          label="Tags"
          value={data.tags || []}
          onChange={(v: any) => setData('tags', v)}
          dark={dark}
          placeholder="Tekan enter untuk menambah tag"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Batal
        </button>
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
