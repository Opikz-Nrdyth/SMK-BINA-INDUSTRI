// resources/js/Pages/Siswa/ManajemenJawaban/Index.tsx
import { useState, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import ModalView from '~/Components/ModalView'

type ViewMode = 'jenisUjian' | 'mapel' | 'ujian' | 'detail'

interface Ujian {
  id: string
  namaUjian: string
  jenisUjian: string
  mapel?: {
    id: string
    namaMataPelajaran: string
  }
  kode?: string
  waktu?: string
  tanggalUjian?: string
}

interface Kehadiran {
  id: string
  user?: {
    fullName: string
    email: string
  }
  ujian?: {
    id: string
    namaUjian: string
    jenisUjian: string
    mapel?: {
      id: string
      namaMataPelajaran: string
    }
  }
  skor: string
  benar: string
  salah: string
  status: string
  progress: number
  totalSoal: number
  terjawab: number
  tidakTerjawab: number
  perbandingan: string
  createdAt: string
  jawabanFile: string
}

export default function IndexSiswa({
  kehadirans,
  kehadiranPaginate,
  searchQuery = '',
  listUjian,
}: {
  kehadirans: Kehadiran[]
  kehadiranPaginate: any
  searchQuery?: string
  listUjian: Ujian[]
}) {
  const { props } = usePage()

  const [data, setData] = useState<Kehadiran[]>([])
  const [dataSelected, setDataSelected] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(kehadiranPaginate?.currentPage || 1)
  const [search, setSearch] = useState(searchQuery)

  // State untuk folder structure
  const [viewMode, setViewMode] = useState<ViewMode>('jenisUjian')
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<string | null>(null)
  const [selectedMapel, setSelectedMapel] = useState<any>(null)
  const [selectedUjian, setSelectedUjian] = useState<any | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; action: () => void }[]>([])

  useEffect(() => {
    if (!kehadirans) return

    const formattedData = kehadirans.map((item: Kehadiran) => ({
      ...item,
      id: item.id,
      namaSiswa: item?.user?.fullName || '-',
      email: item?.user?.email || '-',
      namaUjian: item?.ujian?.namaUjian || '-',
      jenisUjian: item?.ujian?.jenisUjian || '-',
      mapel: item?.ujian?.mapel?.namaMataPelajaran || '-',
      mapelId: item?.ujian?.mapel?.id || '-',
      ujianId: item?.ujian?.id || '-',
    }))
    setData(formattedData)
  }, [kehadirans])

  // Group data by jenis ujian yang dimiliki siswa
  const jenisUjianData = data.reduce((acc: any, kehadiran: any) => {
    const jenis = kehadiran.jenisUjian || 'Tidak ada jenis'

    if (!acc[jenis]) {
      acc[jenis] = {
        id: jenis,
        namaJenisUjian: jenis,
        jumlahMapel: 0,
        jumlahUjian: 0,
        mapelList: new Set(),
      }
    }

    // Hitung mapel unik
    if (kehadiran.mapelId && !acc[jenis].mapelList.has(kehadiran.mapelId)) {
      acc[jenis].mapelList.add(kehadiran.mapelId)
      acc[jenis].jumlahMapel += 1
    }

    acc[jenis].jumlahUjian += 1

    return acc
  }, {})

  // Group data by mapel untuk jenis ujian tertentu
  const mapelData = selectedJenisUjian
    ? data
        .filter((item: any) => item.jenisUjian === selectedJenisUjian)
        .reduce((acc: any, item: any) => {
          const mapelId = item.mapelId
          const mapelName = item.mapel

          if (!acc[mapelId]) {
            acc[mapelId] = {
              id: mapelId,
              namaMapel: mapelName,
              jumlahUjian: 0,
              ujianList: [],
            }
          }

          // Cek apakah ujian sudah ada dalam list
          const ujianExists = acc[mapelId].ujianList.some((ujian: any) => ujian.id === item.ujianId)

          if (!ujianExists) {
            acc[mapelId].ujianList.push({
              id: item.ujianId,
              namaUjian: item.namaUjian,
              skor: item.skor,
              status: item.status,
              progress: item.progress,
            })
            acc[mapelId].jumlahUjian += 1
          }

          return acc
        }, {})
    : {}

  // Data ujian untuk mapel tertentu
  const ujianData = selectedMapel
    ? data.filter((item: any) => item.mapelId === selectedMapel.id)
    : []

  // Handler untuk memilih jenis ujian
  const handleSelectJenisUjian = (jenisUjian: any) => {
    setSelectedJenisUjian(jenisUjian.namaJenisUjian)
    setViewMode('mapel')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: jenisUjian.namaJenisUjian, action: () => {} },
    ])
  }

  // Handler untuk memilih mapel
  const handleSelectMapel = (mapel: any) => {
    setSelectedMapel(mapel)
    setViewMode('ujian')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian!, action: () => handleBackToMapel() },
      { label: mapel.namaMapel, action: () => {} },
    ])
  }

  // Handler untuk memilih ujian
  const handleSelectUjian = (ujian: any) => {
    setSelectedUjian(ujian)
    setViewMode('detail')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian!, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => handleBackToUjian() },
      { label: ujian.namaUjian, action: () => {} },
    ])
  }

  // Handler untuk kembali ke jenis ujian
  const handleBackToJenisUjian = () => {
    setSelectedJenisUjian(null)
    setSelectedMapel(null)
    setSelectedUjian(null)
    setViewMode('jenisUjian')
    setBreadcrumbs([])
  }

  // Handler untuk kembali ke mapel
  const handleBackToMapel = () => {
    setSelectedMapel(null)
    setSelectedUjian(null)
    setViewMode('mapel')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian!, action: () => {} },
    ])
  }

  // Handler untuk kembali ke ujian
  const handleBackToUjian = () => {
    setSelectedUjian(null)
    setViewMode('ujian')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian!, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => {} },
    ])
  }

  const handlePageChange = (page: number) => {
    router.get(
      `/siswa/manajemen-jawaban`,
      { page, search },
      {
        preserveState: true,
        replace: true,
      }
    )
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      `/siswa/manajemen-jawaban`,
      { page: 1, search: searchTerm },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  // Render Breadcrumbs
  const renderBreadcrumbs = () => (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <svg
                className="w-3 h-3 text-gray-400 mx-1"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>
            )}
            <button
              onClick={crumb.action}
              className={`inline-flex items-center text-sm font-medium ${
                index === breadcrumbs.length - 1
                  ? 'text-blue-600 dark:text-blue-400 cursor-default'
                  : 'text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white cursor-pointer'
              }`}
            >
              {crumb.label}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )

  // Progress Bar Component
  const ProgressBar = ({ progress, status }: { progress: number; status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case 'Selesai':
          return 'bg-green-500'
        case 'Dalam Pengerjaan':
          return 'bg-yellow-500'
        case 'Belum Mulai':
          return 'bg-gray-300'
        default:
          return 'bg-blue-500'
      }
    }

    const getStatusTextColor = () => {
      switch (status) {
        case 'Selesai':
          return 'text-green-600'
        case 'Dalam Pengerjaan':
          return 'text-yellow-600'
        case 'Belum Mulai':
          return 'text-gray-600'
        default:
          return 'text-blue-600'
      }
    }

    return (
      <div className="flex items-center gap-3">
        <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className={`h-2 rounded-full ${getStatusColor()}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className={`text-xs font-medium ${getStatusTextColor()}`}>
          {progress}% • {status}
        </span>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {viewMode === 'jenisUjian' && 'Hasil Ujian Saya'}
          {viewMode === 'mapel' && `Mata Pelajaran - ${selectedJenisUjian}`}
          {viewMode === 'ujian' && `Ujian - ${selectedMapel?.namaMapel}`}
          {viewMode === 'detail' && `Detail Hasil - ${selectedUjian?.namaUjian}`}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {viewMode === 'jenisUjian' && 'Lihat hasil ujian berdasarkan jenis ujian'}
          {viewMode === 'mapel' && `Pilih mata pelajaran untuk melihat detail ujian`}
          {viewMode === 'ujian' && `Pilih ujian untuk melihat hasil lengkap`}
          {viewMode === 'detail' && `Detail lengkap hasil ujian Anda`}
        </p>
        {breadcrumbs.length > 0 && renderBreadcrumbs()}
      </div>

      {/* View: Jenis Ujian */}
      {viewMode === 'jenisUjian' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(jenisUjianData).map((jenis: any) => (
            <div
              key={jenis.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleSelectJenisUjian(jenis)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {jenis.namaJenisUjian}
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Mata Pelajaran:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {jenis.jumlahMapel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Ujian:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {jenis.jumlahUjian}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Klik untuk melihat mata pelajaran
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Mapel */}
      {viewMode === 'mapel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(mapelData).map((mapel: any) => (
            <div
              key={mapel.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
              onClick={() => handleSelectMapel(mapel)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <svg
                        className="w-6 h-6 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {mapel.namaMapel}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {mapel.jumlahUjian} ujian
                      </p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Klik untuk melihat daftar ujian
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Ujian */}
      {viewMode === 'ujian' && (
        <div className="space-y-4">
          {ujianData.map((ujian: any) => (
            <div
              key={ujian.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleSelectUjian(ujian)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                      <svg
                        className="w-6 h-6 text-purple-600 dark:text-purple-400"
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
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ujian.namaUjian}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ujian.jenisUjian} • {selectedMapel?.namaMapel}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {ujian.skor}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Skor</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {ujian.benar}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Benar</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {ujian.salah}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Salah</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      {ujian.terjawab}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Terjawab</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      {ujian.tidakTerjawab}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tidak Terjawab</div>
                  </div>
                </div>

                <ProgressBar progress={ujian.progress} status={ujian.status} />

                <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>Klik untuk melihat detail lengkap</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Detail Ujian */}
      {viewMode === 'detail' && selectedUjian && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
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
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedUjian.namaUjian}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedJenisUjian} • {selectedMapel?.namaMapel}
                </p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {selectedUjian.skor}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Skor</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {selectedUjian.benar}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Jawaban Benar</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                  {selectedUjian.salah}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Jawaban Salah</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {selectedUjian.perbandingan}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Progress</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status Pengerjaan
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {selectedUjian.progress}%
                </span>
              </div>
              <ProgressBar progress={selectedUjian.progress} status={selectedUjian.status} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Aksi untuk melihat jawaban
                  router.visit(`/siswa/preview/${selectedUjian.id}`)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                Lihat Jawaban Saya
              </button>

              <button
                onClick={handleBackToUjian}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Kembali
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Informasi Ujian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Tanggal Ujian:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(selectedUjian.createdAt).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span
                    className={`ml-2 font-medium ${
                      selectedUjian.status === 'Selesai'
                        ? 'text-green-600 dark:text-green-400'
                        : selectedUjian.status === 'Dalam Pengerjaan'
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {selectedUjian.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode === 'jenisUjian' && Object.keys(jenisUjianData).length === 0 && (
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Belum Ada Hasil Ujian
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Anda belum mengikuti ujian apapun. Silakan ikuti ujian terlebih dahulu.
          </p>
        </div>
      )}

      <ModalView
        data={dataSelected}
        exclude={['*id', 'userId', 'ujianId', 'user', 'ujian', 'mapelId', 'jawabanFile']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

IndexSiswa.layout = (page: any) => <SiswaLayout>{page}</SiswaLayout>
