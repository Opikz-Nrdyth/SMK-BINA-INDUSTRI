// resources/js/Pages/Kehadiran/Index.tsx
import { useState, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import ModalView from '~/Components/ModalView'
import { Nilai } from './types'
import UniversalInput from '~/Components/UniversalInput'
import StafLayout from '~/Layouts/StafLayouts'

type ViewMode = 'mapel' | 'siswa' | 'detail'

export default function Index({
  kehadirans,
  kehadiranPaginate,
  searchQuery = '',
  namaUjianFilter = '',
  listUjian,
}: {
  kehadirans: Nilai[]
  kehadiranPaginate: any
  searchQuery?: string
  namaUjianFilter?: string
  listUjian: any[]
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(kehadiranPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(kehadiranPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [namaUjian, setNamaUjian] = useState(namaUjianFilter)

  // State untuk folder structure
  const [viewMode, setViewMode] = useState<ViewMode>('mapel')
  const [selectedMapel, setSelectedMapel] = useState<any>(null)
  const [selectedSiswa, setSelectedSiswa] = useState<any>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<{ label: string; action: () => void }[]>([])

  // State untuk pagination siswa
  const [siswaCurrentPage, setSiswaCurrentPage] = useState(1)
  const [siswaSearch, setSiswaSearch] = useState('')

  useEffect(() => {
    if (!kehadirans) return

    const newData = [] as any
    kehadirans.map((item: any) => {
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
      })
    })
    setData(newData)
  }, [kehadirans])

  // Group data by mapel
  const mapelData = listUjian.reduce((acc: any, ujian: any) => {
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

    // Hitung siswa untuk ujian ini
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

  // Handler untuk memilih mapel
  const handleSelectMapel = (mapel: any) => {
    setSelectedMapel(mapel)
    setViewMode('siswa')
    setSiswaCurrentPage(1)
    setSiswaSearch('')
    setBreadcrumbs([
      { label: 'Semua Mapel', action: () => handleBackToMapel() },
      { label: mapel.namaMapel, action: () => {} },
    ])
  }

  // Handler untuk memilih siswa
  const handleSelectSiswa = (siswa: any) => {
    setSelectedSiswa(siswa)
    setViewMode('detail')
    setBreadcrumbs([
      { label: 'Semua Mapel', action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => handleBackToSiswa() },
      { label: siswa.namaSiswa, action: () => {} },
    ])
  }

  // Handler untuk kembali ke mapel
  const handleBackToMapel = () => {
    setSelectedMapel(null)
    setSelectedSiswa(null)
    setViewMode('mapel')
    setBreadcrumbs([])
  }

  // Handler untuk kembali ke siswa
  const handleBackToSiswa = () => {
    setSelectedSiswa(null)
    setViewMode('siswa')
    setBreadcrumbs([
      { label: 'Semua Mapel', action: () => handleBackToMapel() },
      { label: selectedMapel.namaMapel, action: () => {} },
    ])
  }

  // Data siswa untuk view mode 'siswa'
  const allSiswaData = selectedMapel
    ? Array.from(
        new Map(
          data
            .filter((item: any) => item.mapelId === selectedMapel.id)
            .map((item: any) => [item.userId, item])
        ).values()
      )
    : []

  // Data detail untuk view mode 'detail'
  const detailData = selectedSiswa
    ? data.filter(
        (item: any) => item.userId === selectedSiswa.userId && item.mapelId === selectedMapel.id
      )
    : []

  // Hitung statistik untuk siswa
  const getSiswaStats = (siswa: any) => {
    const siswaUjian = data.filter(
      (item: any) => item.userId === siswa.userId && item.mapelId === selectedMapel.id
    )

    const totalUjian = siswaUjian.length
    const rataRataSkor =
      totalUjian > 0
        ? (
            siswaUjian.reduce((sum: number, item: any) => sum + parseFloat(item.skor || 0), 0) /
            totalUjian
          ).toFixed(2)
        : 0

    return { totalUjian, rataRataSkor }
  }

  const optionUjian = listUjian.map((item: any) => ({
    label: `${item.namaUjian}/${item.mapel.namaMataPelajaran}`,
    value: item.id,
  }))

  const handlePageChange = (page: number) => {
    router.get(
      `/SuperAdmin/manajemen-kehadiran`,
      { page, search, nama_ujian: namaUjian },
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
      `/SuperAdmin/manajemen-kehadiran`,
      { page: 1, search: searchTerm, nama_ujian: namaUjian },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleNamaUjianFilter = (value: string) => {
    setNamaUjian(value)
    router.get(
      `/SuperAdmin/manajemen-kehadiran`,
      { page: 1, search, nama_ujian: value },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  // Handler untuk search siswa (client-side)
  const handleSiswaSearch = (searchTerm: string) => {
    setSiswaSearch(searchTerm)
  }

  // Filter siswa berdasarkan search (client-side)
  const filteredSiswaData = allSiswaData.filter(
    (siswa: any) =>
      siswa.namaSiswa.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      siswa.nisn.toLowerCase().includes(siswaSearch.toLowerCase()) ||
      siswa.email.toLowerCase().includes(siswaSearch.toLowerCase())
  )

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
                  : 'text-gray-700 hover:text-purple-600 dark:text-gray-400 dark:hover:text-white cursor-pointer transition-colors duration-200'
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
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {viewMode === 'mapel' && 'Data Mata Pelajaran'}
            {viewMode === 'siswa' && `Siswa - ${selectedMapel?.namaMapel}`}
            {viewMode === 'detail' && `Detail Kehadiran - ${selectedSiswa?.namaSiswa}`}
          </h1>
          {breadcrumbs.length > 0 && renderBreadcrumbs()}
        </div>
        {selectedMapel && (
          <a
            href={`${props.pattern}/cetak`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            <i className="fa-solid fa-file-excel"></i> Export Excell
          </a>
        )}
      </div>

      {/* Filter hanya tampil di view mapel */}
      {viewMode === 'mapel' && (
        <div className="mb-4">
          <UniversalInput
            name="ujian"
            type="select"
            options={optionUjian}
            placeholder="Filter berdasarkan nama ujian..."
            value={namaUjian}
            onChange={(e) => handleNamaUjianFilter(e)}
          />
        </div>
      )}

      {/* View: Mapel */}
      {viewMode === 'mapel' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(mapelData).map((mapel: any) => (
            <div
              key={mapel.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow cursor-pointer hover:border-purple-300 dark:hover:border-purple-600"
              onClick={() => handleSelectMapel(mapel)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mapel.namaMapel}
                </h3>
                <svg
                  className="w-5 h-5 text-purple-500"
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
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {mapel.jumlahUjian}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Total Siswa:</span>
                  <span className="font-medium text-pink-600 dark:text-pink-400">
                    {mapel.jumlahSiswa}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-purple-500 dark:text-purple-400">
                  Klik untuk melihat daftar siswa
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View: Siswa (Tabel) */}
      {viewMode === 'siswa' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Daftar Siswa - {selectedMapel?.namaMapel}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total {allSiswaData.length} siswa
            </p>
          </div>

          <DataTable
            data={filteredSiswaData.map((siswa: any) => ({
              ...siswa,
              ...getSiswaStats(siswa),
            }))}
            tabelName="Siswa"
            columns={[
              { header: 'NISN', accessor: 'nisn' as const },
              { header: 'Nama Siswa', accessor: 'namaSiswa' as const },
              { header: 'Email', accessor: 'email' as const },
              {
                header: 'Total Ujian',
                accessor: 'totalUjian' as const,
              },
              {
                header: 'Rata-rata Skor',
                accessor: 'rataRataSkor' as const,
              },
            ]}
            pageSize={15}
            placeholder="Cari NISN, nama, atau email..."
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

      {/* View: Detail Kehadiran */}
      {viewMode === 'detail' && (
        <div>
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Detail Kehadiran - {selectedSiswa?.namaSiswa}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              NISN: {selectedSiswa?.nisn} • Email: {selectedSiswa?.email}
            </p>
          </div>

          <DataTable
            data={detailData}
            tabelName="Kehadiran"
            columns={[
              { header: 'Nama Ujian', accessor: 'namaUjian' as const },
              { header: 'Jenis Ujian', accessor: 'jenisUjian' as const },
              { header: 'Skor', accessor: 'skor' as const },
              { header: 'Benar', accessor: 'benar' as const },
              { header: 'Salah', accessor: 'salah' as const },
              {
                header: 'Tanggal Ujian',
                isTime: { mode: 'date', withDay: true },
                accessor: 'createdAt' as const,
              },
            ]}
            pageSize={15}
            placeholder="Cari nama ujian..."
            noDataText="Tidak ada data kehadiran"
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
        data={dataSelected}
        exclude={[
          '*id',
          'userId',
          'ujianId',
          'jawabanFile',
          'ujian.jurusan',
          'ujian.penulis',
          'ujian.mapel.guruAmpu',
          '*mapelId',
          'user',
        ]}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
