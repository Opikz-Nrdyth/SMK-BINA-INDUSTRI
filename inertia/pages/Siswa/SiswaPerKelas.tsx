import { useState, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import { Siswa } from '../Siswa/types'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface Kelas {
  namaKelas: string
  jumlahSiswa: number
  waliKelas: string
}

export default function SiswaPerKelas({
  auth,
  siswas,
  siswaPaginate,
  kelasList,
  selectedKelas = '',
  searchQuery = '',
}: {
  auth: any
  siswas: Siswa[]
  siswaPaginate: any
  kelasList: Kelas[]
  selectedKelas?: string
  searchQuery?: string
}) {
  const { props } = usePage()
  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>(null)
  const [currentPage, setCurrentPage] = useState(siswaPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(siswaPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [selectedKelasState, setSelectedKelasState] = useState(selectedKelas)

  useEffect(() => {
    if (!siswas) return
    const newData = siswas.map((item: Siswa) => ({
      ...item,
      id: item.nisn,
      fullName: item?.user?.fullName || '-',
      email: item?.user?.email || '-',
    }))
    setData(newData)
  }, [siswas])

  const baseRoute = props.pattern

  const handleSelectKelas = (kelasName: string) => {
    setSelectedKelasState(kelasName)
    setCurrentPage(1)
    router.get(
      baseRoute,
      { page: 1, kelas: kelasName, search },
      { preserveState: true, replace: true }
    )
  }

  const handleShowAllSiswa = () => {
    setSelectedKelasState('')
    setCurrentPage(1)
    router.get(baseRoute, { page: 1, kelas: '', search }, { preserveState: true, replace: true })
  }

  const handlePageChange = (page: number) => {
    router.get(
      baseRoute,
      { page, kelas: selectedKelasState, search },
      { preserveState: true, replace: true, preserveScroll: true }
    )
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      baseRoute,
      { page: 1, kelas: selectedKelasState, search: searchTerm },
      { preserveState: true, replace: true, preserveScroll: true }
    )
    setCurrentPage(1)
  }

  // Kolom tabel
  const siswaColumns = [
    { header: 'No.', accessor: 'nomor_absen' as const },
    { header: 'NISN', accessor: 'nisn' as const },
    { header: 'Nama Lengkap', accessor: 'fullName' as const },
    { header: 'Jenis Kelamin', accessor: 'jenisKelamin' as const },
    { header: 'Kelas', accessor: 'nama_kelas' as const },
  ]

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Data Siswa</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Daftar seluruh siswa berdasarkan kelas di sekolah.
        </p>
      </div>

      {/* Kartu Kelas */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pilih Kelas</h2>
          {selectedKelasState && (
            <button
              onClick={handleShowAllSiswa}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Lihat Semua Siswa
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {kelasList.map((kelas) => (
            <div
              key={kelas.namaKelas}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow border p-4 cursor-pointer transition-all duration-200 ${
                selectedKelasState === kelas.namaKelas
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
              }`}
              onClick={() => handleSelectKelas(kelas.namaKelas)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">{kelas.namaKelas}</h3>
                <div className="text-lg">🏫</div>
              </div>

              <div className="mt-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {kelas.jumlahSiswa}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Siswa</div>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-100 mt-2">
                Wali Kelas:{' '}
                <span className="bg-yellow-600 rounded-full px-2 py-1 text-white">
                  {kelas.waliKelas}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div
                  className={`text-sm font-medium ${
                    selectedKelasState === kelas.namaKelas
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {selectedKelasState === kelas.namaKelas ? '✓ Sedang dipilih' : 'Pilih kelas →'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {kelasList.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 dark:text-gray-500 text-4xl mb-3">🏫</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum ada data kelas
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Data kelas belum tersedia, tambahkan melalui menu manajemen kelas.
            </p>
          </div>
        )}
      </div>

      {/* Tabel Siswa */}
      <DataTable
        data={data}
        tabelName={selectedKelasState ? `Siswa ${selectedKelasState}` : 'Semua Data Siswa'}
        columns={siswaColumns}
        pageSize={15}
        placeholder="Cari siswa..."
        noDataText={
          selectedKelasState
            ? `Tidak ada siswa di kelas ${selectedKelasState}`
            : 'Tidak ada data siswa ditemukan.'
        }
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: siswaPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        viewModal
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      {/* Modal Detail Siswa */}
      {dataSelected && (
        <ModalView
          data={dataSelected}
          include={[
            'fullName',
            'nisn',
            'jenisKelamin',
            'tempatLahir',
            'tanggalLahir',
            'agama',
            'nama_kelas',
            'alamat',
          ]}
          open={!!dataSelected}
          onClose={() => setDataSelected(null)}
          title={`Detail Siswa - ${dataSelected.fullName}`}
        />
      )}
    </div>
  )
}

SiswaPerKelas.layout = (page: any) => {
  if (page.props.user.role == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
