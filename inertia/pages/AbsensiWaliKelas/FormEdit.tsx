// resources/js/Pages/absensi_wali_kelas/FormEdit.tsx
import React from 'react'
import { useForm, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'

interface Options {
  label: string
  value: string
}

interface Props {
  initialValues?: any
  onSubmit: (data: any) => void
  submitLabel: string
  dark?: boolean
  userOptions?: Options[]
  kelasOptions?: Options[]
}

export default function FormEdit({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  userOptions,
  kelasOptions,
}: Props) {
  const { data, setData, processing, errors } = useForm(
    initialValues || {
      userId: '',
      kelasId: '',
      status: 'Hadir',
      hari: '',
    }
  )

  const { props } = usePage()
  const pattern = String(props.pattern)
    .split('/')
    .filter((item) => item != '')
  const pathPattern = `${pattern[0]}/${pattern[1]}/${pattern[2]}`

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const statusOptions = [
    { label: 'Hadir', value: 'Hadir' },
    { label: 'Sakit', value: 'Sakit' },
    { label: 'Alfa', value: 'Alfa' },
    { label: 'Izin', value: 'Izin' },
    { label: 'PKL', value: 'PKL' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Display current data info */}
      {initialValues?.userName && (
        <div className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg border border-purple-200">
          <h3 className="text-lg font-medium text-purple-800 dark:text-purple-500 mb-2">
            Data yang akan diubah:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm dark:text-white">
            <div>
              <span className="font-medium">Siswa:</span> {initialValues.userName}
            </div>
            <div>
              <span className="font-medium">Kelas:</span> {initialValues.kelasName}
            </div>
            <div>
              <span className="font-medium">Status Saat Ini:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  initialValues.status === 'Hadir'
                    ? 'bg-green-100 text-green-800'
                    : initialValues.status === 'Sakit'
                      ? 'bg-yellow-100 text-yellow-800'
                      : initialValues.status === 'Alfa'
                        ? 'bg-red-100 text-red-800'
                        : initialValues.status === 'Izin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-purple-100 text-purple-800'
                }`}
              >
                {initialValues.status}
              </span>
            </div>
            <div>
              <span className="font-medium">Tanggal:</span>{' '}
              {initialValues.hari ? new Date(initialValues.hari).toLocaleDateString('id-ID') : '-'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UniversalInput
          type="select"
          name="userId"
          label="Siswa"
          value={data.userId}
          onChange={(v: any) => setData('userId', v)}
          options={userOptions || []}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="kelasId"
          label="Kelas"
          value={data.kelasId}
          onChange={(v: any) => setData('kelasId', v)}
          options={kelasOptions || []}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="status"
          label="Status Kehadiran"
          value={data.status}
          onChange={(v: any) => setData('status', v)}
          options={statusOptions}
          required
          dark={dark}
        />

        <UniversalInput
          type="date"
          name="hari"
          label="Hari"
          value={data.hari}
          onChange={(v: any) => setData('hari', v)}
          required
          dark={dark}
        />
      </div>

      {errors && Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-medium mb-2">Terjadi kesalahan:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <a
          href={pathPattern}
          className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Kembali
        </a>
        <button
          type="submit"
          disabled={processing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
        >
          {processing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  )
}
