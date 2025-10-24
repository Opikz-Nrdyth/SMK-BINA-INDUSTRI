// resources/js/Pages/Siswa/JadwalUjian.tsx
import { Link, router } from '@inertiajs/react'
import { ReactNode, useEffect, useState } from 'react'
import { timeFormat } from '~/Components/FormatWaktu'
import { useNotification } from '~/Components/NotificationAlert'
import UniversalInput from '~/Components/UniversalInput'
import SiswaLayout from '~/Layouts/SiswaLayouts'

export type Ujian = {
  id: string
  namaUjian: string
  mapel: string
  jenjang: string
  jurusan: string[]
  kode: string
  jenisUjian: string
  waktu: string
  tanggalUjian: string
  jamMulai: string
  jamSelesai: string
  status: 'Belum Dimulai' | 'Berlangsung' | 'Selesai' | 'Akan Datang'
  durasi: string
  penulis: string[]
}

export default function JadwalUjian({ bankSoal }: { bankSoal: any[] }) {
  const [ujianList, setUjianList] = useState<Ujian[]>([])
  const [ujianSelected, setUjianSelected] = useState<Ujian | null>(null)
  const [loading, setLoading] = useState(false)
  const [ujianCodeInput, setUjianCodeInput] = useState('')
  const [viewCodeInput, setViewCodeInput] = useState(true)

  const { notify } = useNotification()
  useEffect(() => {
    const convertBankSoals = bankSoal.map((item: any) => {
      const tanggalUjian = new Date(item.tanggalUjian)
      const now = new Date()

      // Hitung jam selesai berdasarkan waktu (dalam menit)
      const jamMulai = tanggalUjian
      const jamSelesai = new Date(tanggalUjian.getTime() + parseInt(item.waktu) * 60000)

      // Tentukan status berdasarkan waktu
      let status: 'Belum Dimulai' | 'Berlangsung' | 'Selesai' | 'Akan Datang' = 'Akan Datang'

      if (now < jamMulai) {
        status = 'Akan Datang'
      } else if (now >= jamMulai && now <= jamSelesai) {
        status = 'Berlangsung'
      } else if (now > jamSelesai) {
        status = 'Selesai'
      }

      return {
        id: item.id,
        namaUjian: item.namaUjian,
        mapel: item.mapel?.namaMataPelajaran || 'Tidak ada mapel',
        jenjang: `Kelas ${item.jenjang}`,
        jurusan: item.jurusan || [],
        jenisUjian: item.jenisUjian,
        waktu: item.waktu,
        kode: item.kode,
        tanggalUjian: item.tanggalUjian,
        jamMulai: jamMulai.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        jamSelesai: jamSelesai.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: status,
        durasi: `${item.waktu} menit`,
        penulis: item.penulis || [],
      }
    })

    setUjianList(convertBankSoals)
  }, [bankSoal])

  useEffect(() => {
    if (localStorage.getItem('codeUjian')) {
      setUjianCodeInput(localStorage.codeUjian)
      if (ujianSelected?.kode == localStorage.codeUjian) {
        setViewCodeInput(false)
      }
    }
  }, [ujianSelected])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Berlangsung':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Akan Datang':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Selesai':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Belum Dimulai':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Berlangsung':
        return 'Sedang Berlangsung'
      case 'Akan Datang':
        return 'Akan Datang'
      case 'Selesai':
        return 'Selesai'
      case 'Belum Dimulai':
        return 'Belum Dimulai'
      default:
        return status
    }
  }

  const mulaiUjian = () => {
    setLoading(true)
    if (ujianSelected?.kode.trim() && ujianSelected?.kode.trim() == ujianCodeInput) {
      localStorage.setItem('codeUjian', ujianCodeInput)
      router.visit(`/siswa/ujian/${ujianSelected.id}`)
      setLoading(false)
    }
    if (ujianSelected?.kode.trim() && ujianSelected?.kode.trim() != ujianCodeInput) {
      notify('Kode Ujian Salah', 'error')
    }

    if (!ujianSelected?.kode.trim()) {
      router.visit(`/siswa/ujian/${ujianSelected?.id}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Ujian</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Daftar ujian yang akan Anda ikuti</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ujianList.map((ujian) => (
          <div
            key={ujian.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-transform duration-300 hover:shadow-lg"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mb-2">
                    {ujian.jenisUjian}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {ujian.namaUjian}
                  </h3>
                </div>
              </div>

              {/* Mapel dan Jenjang */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {ujian.mapel}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{ujian.jenjang}</p>
              </div>

              {/* Tanggal dan Waktu */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {new Date(ujian.tanggalUjian).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {ujian.jamMulai} - {ujian.jamSelesai} ({ujian.durasi})
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ujian.status)}`}
                >
                  {getStatusText(ujian.status)}
                </span>

                {ujian.status === 'Berlangsung' ? (
                  <button
                    onClick={() => {
                      setUjianSelected(ujian)
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {ujian.status === 'Berlangsung' ? 'Mulai Ujian' : 'Lihat Detail'}
                  </button>
                ) : ujian.status === 'Akan Datang' ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                  >
                    Belum Dimulai
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-md cursor-not-allowed"
                  >
                    Selesai
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ujianList.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            Tidak ada jadwal ujian
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Belum ada ujian yang dijadwalkan untuk Anda.
          </p>
        </div>
      )}

      {ujianSelected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Masuk Ujian</h2>
                <button
                  onClick={() => {
                    setUjianSelected(null)
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                {ujianSelected?.kode.trim() && viewCodeInput
                  ? 'Masukkan kode ujian yang diberikan pengawas'
                  : 'Anda akan masuk ke ujian'}
              </p>
            </div>

            <div className="p-6">
              {ujianSelected?.kode.trim() && viewCodeInput ? (
                // Jika ada kode, tampilkan input
                <div className="mb-6">
                  <label
                    htmlFor="examCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Kode Ujian
                  </label>
                  <UniversalInput
                    name="kode"
                    value={ujianCodeInput}
                    onChange={(e) => setUjianCodeInput(e)}
                    type="text"
                    placeholder="Contoh: KodeUjian123"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-base font-mono tracking-wide bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    Masukkan kode dengan benar
                  </p>
                </div>
              ) : (
                // Jika tidak ada kode, tampilkan info
                <div className="mb-6 text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Siap Mulai Ujian
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Anda dapat langsung masuk ke ujian tanpa kode
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setUjianSelected(null)}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium transition-colors border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    mulaiUjian()
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    'Masuk Ujian'
                  )}
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pastikan koneksi internet stabil
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

JadwalUjian.layout = (page: ReactNode) => <SiswaLayout title="Jadwal Ujian">{page}</SiswaLayout>
