// resources/js/Pages/ManajemenJawaban/Index.tsx
import { useState, useEffect } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import ModalView from '~/Components/ModalView'
import { Nilai } from '../Nilai/types'
import GuruLayout from '~/Layouts/GuruLayouts'
import { io } from 'socket.io-client'
import { useNotification } from '~/Components/NotificationAlert'
import { getSocket } from './socket'

type ViewMode = 'jenisUjian' | 'mapel' | 'ujian' | 'siswa' | 'detail'

export default function Index({
  kehadirans,
  kehadiranPaginate,
  searchQuery = '',
  listUjian,
}: {
  kehadirans: Nilai[]
  kehadiranPaginate: any
  searchQuery?: string
  listUjian: any[]
}) {
  const { props } = usePage()

  const pattern = props.pattern

  const { notify } = useNotification()

  const socket = getSocket()

  useEffect(() => {
    socket.on('user_joined', (data: any) => {
      console.log('🟢', data.message)
    })

    socket.on('new_message', (data: any) => {
      notify(`${data.message}`, 'info')
    })

    return () => {
      socket.off('user_joined')
    }
  }, [])

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(kehadiranPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(kehadiranPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  // State untuk folder structure
  const [viewMode, setViewMode] = useState<ViewMode>('jenisUjian')
  const [selectedJenisUjian, setSelectedJenisUjian] = useState<any>(null)
  const [selectedMapel, setSelectedMapel] = useState<any>(null)
  const [selectedUjian, setSelectedUjian] = useState<any>(null)
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; action: () => void }[]>([])

  // State untuk search masing-masing level
  const [mapelSearch, setMapelSearch] = useState('')
  const [ujianSearch, setUjianSearch] = useState('')
  const [siswaSearch, setSiswaSearch] = useState('')

  useEffect(() => {
    if (!kehadirans) return

    const newData = [] as any
    kehadirans.map((item: Nilai) => {
      newData.push({
        ...item,
        id: item.id,
        namaSiswa: item?.user?.fullName || '-',
        email: item?.user?.email || '-',
        nisn: item?.user?.dataSiswa?.nisn || '-',
        namaUjian: item?.ujian?.namaUjian || '-',
        jenisUjian: item?.ujian?.jenisUjian || '-',
        mapel: item?.ujian?.mapel?.namaMataPelajaran || '-',
        mapelId: item?.ujian?.mapel?.id || '-',
        ujianId: item?.ujian?.id || '-',
      })
    })
    setData(newData)
  }, [kehadirans])

  // Group data by jenis ujian
  const jenisUjianData = listUjian.reduce((acc: any, ujian: any) => {
    const jenis = ujian.jenisUjian || 'Tidak ada jenis'

    if (!acc[jenis]) {
      acc[jenis] = {
        id: jenis,
        namaJenisUjian: jenis,
        jumlahMapel: 0,
        jumlahUjian: 0,
        jumlahSiswa: 0,
      }
    }

    acc[jenis].jumlahUjian += 1

    // Hitung siswa untuk ujian ini
    const siswaUjian = data.filter((item: any) => item.ujianId === ujian.id)
    acc[jenis].jumlahSiswa += siswaUjian.length

    return acc
  }, {})

  // Group data by mapel untuk jenis ujian tertentu
  const mapelData = selectedJenisUjian
    ? listUjian
        .filter((ujian: any) => ujian.jenisUjian === selectedJenisUjian.namaJenisUjian)
        .reduce((acc: any, ujian: any) => {
          const mapelName = ujian.mapel?.namaMataPelajaran || 'Tidak ada mapel'
          const mapelId = ujian.mapel?.id || 'no-id'

          if (!acc[mapelId]) {
            acc[mapelId] = {
              id: mapelId,
              namaMapel: mapelName,
              jumlahUjian: 0,
              jumlahSiswa: 0,
              ujianList: [],
            }
          }

          const siswaUjian = data.filter((item: any) => item.ujianId === ujian.id)
          acc[mapelId].jumlahUjian += 1
          acc[mapelId].jumlahSiswa += siswaUjian.length
          acc[mapelId].ujianList.push({
            id: ujian.id,
            namaUjian: ujian.namaUjian,
            siswa: siswaUjian,
          })

          return acc
        }, {})
    : {}

  // Data ujian untuk mapel tertentu
  const ujianData = selectedMapel
    ? listUjian
        .filter(
          (ujian: any) =>
            ujian.mapel?.id === selectedMapel.id &&
            ujian.jenisUjian === selectedJenisUjian.namaJenisUjian
        )
        .map((value) => ({
          ...value,
          kode: value.kode ?? '-',
        }))
    : []

  // Data siswa untuk ujian tertentu
  const siswaData = selectedUjian
    ? data.filter((item: any) => item.ujianId === selectedUjian.id)
    : []

  // Handler untuk memilih jenis ujian
  const handleSelectJenisUjian = (jenisUjian: any) => {
    setSelectedJenisUjian(jenisUjian)
    setViewMode('mapel')
    setMapelSearch('')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: jenisUjian.namaJenisUjian, action: () => {} },
    ])
  }

  // Handler untuk memilih mapel
  const handleSelectMapel = (mapel: any) => {
    setSelectedMapel(mapel)
    setViewMode('ujian')
    setUjianSearch('')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => handleBackToMapel() },
      { label: mapel.namaMapel, action: () => {} },
    ])
  }

  // Handler untuk memilih ujian
  const handleSelectUjian = (ujian: any) => {
    setSelectedUjian(ujian)
    setViewMode('siswa')
    setSiswaSearch('')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => handleBackToUjian() },
      { label: ujian.namaUjian, action: () => {} },
    ])
  }

  // Handler untuk memilih siswa
  const handleSelectSiswa = (siswa: any) => {
    setSelectedSiswa(siswa)
    setViewMode('detail')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => handleBackToUjian() },
      { label: selectedUjian.namaUjian, action: () => handleBackToSiswa() },
      { label: siswa.namaSiswa, action: () => {} },
    ])
  }

  // Handler untuk kembali ke jenis ujian
  const handleBackToJenisUjian = () => {
    setSelectedJenisUjian(null)
    setSelectedMapel(null)
    setSelectedUjian(null)
    setSelectedSiswa(null)
    setViewMode('jenisUjian')
    setBreadcrumbs([])
  }

  // Handler untuk kembali ke mapel
  const handleBackToMapel = () => {
    setSelectedMapel(null)
    setSelectedUjian(null)
    setSelectedSiswa(null)
    setViewMode('mapel')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => {} },
    ])
  }

  // Handler untuk kembali ke ujian
  const handleBackToUjian = () => {
    setSelectedUjian(null)
    setSelectedSiswa(null)
    setViewMode('ujian')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => {} },
    ])
  }

  // Handler untuk kembali ke siswa
  const handleBackToSiswa = () => {
    setSelectedSiswa(null)
    setViewMode('siswa')
    setBreadcrumbs([
      { label: 'Jenis Ujian', action: () => handleBackToJenisUjian() },
      { label: selectedJenisUjian.namaJenisUjian, action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => handleBackToUjian() },
      { label: selectedUjian.namaUjian, action: () => {} },
    ])
  }

  // Filter data berdasarkan search
  const filteredMapelData = Object.values(mapelData).filter((mapel: any) =>
    mapel.namaMapel.toLowerCase().includes(mapelSearch.toLowerCase())
  )

  const filteredUjianData = ujianData.filter((ujian: any) =>
    ujian.namaUjian.toLowerCase().includes(ujianSearch.toLowerCase())
  )

  const filteredSiswaData = siswaData.filter(
    (siswa: any) =>
      siswa.namaSiswa.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      siswa.nisn.toLowerCase().includes(siswaSearch.toLowerCase())
  )

  // Handler untuk search masing-masing level
  const handleMapelSearch = (searchTerm: string) => {
    setMapelSearch(searchTerm)
  }

  const handleUjianSearch = (searchTerm: string) => {
    setUjianSearch(searchTerm)
  }

  const handleSiswaSearch = (searchTerm: string) => {
    setSiswaSearch(searchTerm)
  }

  const handlePageChange = (page: number) => {
    router.get(
      `/SuperAdmin/manajemen-jawaban`,
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
      `/SuperAdmin/manajemen-jawaban`,
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
                  ? 'text-gray-500 dark:text-gray-400 cursor-default'
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

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === 'jenisUjian' && 'Manajemen Jawaban - Jenis Ujian'}
            {viewMode === 'mapel' && `Mapel - ${selectedJenisUjian?.namaJenisUjian}`}
            {viewMode === 'ujian' && `Ujian - ${selectedMapel?.namaMapel}`}
            {viewMode === 'siswa' && `Siswa - ${selectedUjian?.namaUjian}`}
            {viewMode === 'detail' && `Detail Jawaban - ${selectedSiswa?.namaSiswa}`}
          </h1>
          {breadcrumbs.length > 0 && renderBreadcrumbs()}
        </div>
      </div>

      {/* View: Jenis Ujian */}
      {viewMode === 'jenisUjian' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(jenisUjianData).map((jenis: any) => (
            <div
              key={jenis.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSelectJenisUjian(jenis)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {jenis.namaJenisUjian}
                </h3>
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

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Jumlah Ujian:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jenis.jumlahUjian}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Siswa:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {jenis.jumlahSiswa}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Klik untuk melihat mata pelajaran
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Mapel */}
      {viewMode === 'mapel' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Mata Pelajaran - {selectedJenisUjian?.namaJenisUjian}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total {Object.keys(mapelData).length} mata pelajaran
            </p>
          </div>

          <DataTable
            data={filteredMapelData}
            tabelName="Mapel"
            columns={[
              { header: 'Nama Mapel', accessor: 'namaMapel' as const },
              { header: 'Jumlah Ujian', accessor: 'jumlahUjian' as const },
              { header: 'Jumlah Siswa', accessor: 'jumlahSiswa' as const },
            ]}
            pageSize={15}
            placeholder="Cari mata pelajaran..."
            noDataText="Tidak ada data mata pelajaran"
            onRowClick={(value: any) => handleSelectMapel(value)}
            viewModal={true}
            serverSearch={{
              value: mapelSearch,
              onChange: handleMapelSearch,
            }}
          />
        </div>
      )}

      {/* View: Ujian */}
      {viewMode === 'ujian' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daftar Ujian - {selectedMapel?.namaMapel}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedJenisUjian?.namaJenisUjian} • Total {ujianData.length} ujian
            </p>
          </div>

          <DataTable
            data={filteredUjianData}
            tabelName="Ujian"
            columns={[
              { header: 'Nama Ujian', accessor: 'namaUjian' as const },
              { header: 'Kode', accessor: 'kode' as const },
              { header: 'Waktu', accessor: 'waktu' as const },
              {
                header: 'Tanggal Ujian',
                accessor: 'tanggalUjian' as const,
                isTime: { mode: 'date', withDay: true },
              },
            ]}
            pageSize={15}
            placeholder="Cari nama ujian..."
            noDataText="Tidak ada data ujian"
            onRowClick={(value: any) => handleSelectUjian(value)}
            viewModal={true}
            serverSearch={{
              value: ujianSearch,
              onChange: handleUjianSearch,
            }}
          />
        </div>
      )}

      {/* View: Siswa */}
      {viewMode === 'siswa' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daftar Siswa - {selectedUjian?.namaUjian}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedMapel?.namaMapel} • Total {siswaData.length} siswa
            </p>
          </div>

          <DataTable
            data={filteredSiswaData}
            tabelName="Siswa"
            columns={[
              { header: 'NISN', accessor: 'nisn' as const },
              { header: 'Nama Siswa', accessor: 'namaSiswa' as const },
              { header: 'Email', accessor: 'email' as const },
              { header: 'Skor', accessor: 'skor' as const },
              { header: 'Benar', accessor: 'benar' as const },
              { header: 'Salah', accessor: 'salah' as const },
              {
                header: 'Status',
                accessor: 'status' as const,
              },
            ]}
            pageSize={15}
            placeholder="Cari NISN atau nama siswa..."
            noDataText="Tidak ada data siswa"
            onRowClick={(value: any) => handleSelectSiswa(value)}
            viewModal={true}
            serverSearch={{
              value: siswaSearch,
              onChange: handleSiswaSearch,
            }}
          />
        </div>
      )}

      {/* View: Detail Jawaban */}
      {viewMode === 'detail' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Detail Jawaban - {selectedSiswa?.namaSiswa}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ujian: {selectedUjian?.namaUjian} • Mapel: {selectedMapel?.namaMapel}
            </p>
          </div>

          <DataTable
            data={[selectedSiswa]} // Tampilkan detail satu siswa
            tabelName="Jawaban"
            columns={[
              { header: 'Nama Siswa', accessor: 'namaSiswa' as const },
              { header: 'NISN', accessor: 'nisn' as const },
              { header: 'Email', accessor: 'email' as const },
              { header: 'Skor', accessor: 'skor' as const },
              { header: 'Benar', accessor: 'benar' as const },
              { header: 'Salah', accessor: 'salah' as const },
              { header: 'Status', accessor: 'status' as const },
              {
                header: 'Tanggal Ujian',
                isTime: { mode: 'date', withDay: true },
                accessor: 'createdAt' as const,
              },
            ]}
            pageSize={15}
            placeholder="Cari data..."
            noDataText="Tidak ada data jawaban"
            onRowClick={(value: any) => setDataSelected(value)}
            viewModal={true}
            serverPagination={{
              currentPage,
              lastPage,
              total: kehadiranPaginate?.total || 0,
              onPageChange: handlePageChange,
            }}
            serverSearch={{
              value: search,
              onChange: handleSearch,
            }}
          />
        </div>
      )}

      <ModalView
        data={{
          ...dataSelected,
          skor: parseInt(dataSelected?.skor).toFixed(1),
          progress: `${dataSelected?.progress}%`,
        }}
        exclude={[
          '*id',
          'userId',
          'ujianId',
          'user',
          'ujian',
          'mapelId',
          'jawabanFile',
          'Perbandingan',
        ]}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
