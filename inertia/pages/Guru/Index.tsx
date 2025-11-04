import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import ModalImportExcel from '~/Components/modalImportExcel'
import { Guru } from './types'

interface Mapel {
  nama_mata_pelajaran: string
  jumlahGuru: number
}

export default function Index({
  auth,
  gurus,
  guruPaginate,
  mapelList = [],
  selectedMapel = '',
  searchQuery = '',
}: {
  auth: any
  gurus: Guru[]
  guruPaginate: any
  mapelList: Mapel[]
  selectedMapel?: string
  searchQuery?: string
}) {
  const { props } = usePage()
  const [cardMapel, setCardMapel] = useState(false)

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(guruPaginate?.currentPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [selectedMapelState, setSelectedMapelState] = useState(selectedMapel)
  const [importModal, setImportModal] = useState(false)

  // Mapping data guru untuk tabel
  useEffect(() => {
    if (!gurus) return

    const newData = gurus.map((item: Guru) => ({
      ...item,
      id: item.nip,
      fullName: item?.user?.fullName || '-',
      email: item?.user?.email || '-',
    }))
    setData(newData)
  }, [gurus])

  // Handle klik mapel card
  const handleSelectMapel = (mapelName: string) => {
    setSelectedMapelState(mapelName)
    setCurrentPage(1)
    router.get(
      String(props.pattern),
      { page: 1, mapel: mapelName, search },
      { preserveState: true, replace: true }
    )
  }

  // Lihat semua mapel
  const handleShowAll = () => {
    setSelectedMapelState('')
    setCurrentPage(1)
    router.get(
      String(props.pattern),
      { page: 1, mapel: '', search },
      { preserveState: true, replace: true }
    )
  }

  // Pagination
  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page, mapel: selectedMapelState, search },
      { preserveState: true, replace: true, preserveScroll: true }
    )
    setCurrentPage(page)
  }

  // Search
  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      String(props.pattern),
      { page: 1, mapel: selectedMapelState, search: searchTerm },
      { preserveState: true, replace: true, preserveScroll: true }
    )
    setCurrentPage(1)
  }

  // Import Excel
  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('excel_file', file)
    router.post(`${String(props.pattern)}/import`, formData, {
      onSuccess: () => setImportModal(false),
    })
  }

  const columns = [
    { header: 'No', accessor: 'nomor' as const },
    { header: 'NIY', accessor: 'nip' as const },
    { header: 'Nama', accessor: 'fullName' as const },
    { header: 'Email', accessor: 'email' as const },
    { header: 'Jenis Kelamin', accessor: 'jenisKelamin' as const },
    {
      header: 'Tanggal Lahir',
      isTime: { mode: 'date', withDay: true },
      accessor: 'tanggalLahir' as const,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header dan tombol */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Guru</h1>
        <div className="flex flex-wrap items-center lg:gap-3 gap-1">
          <button
            onClick={() => setImportModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Import Guru
          </button>
          <a
            href={`${String(props.pattern)}/export`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Export Guru
          </a>
          <a
            href={`${String(props.pattern)}/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tambah Guru
          </a>
        </div>
      </div>

      {/* Kartu Mapel */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              setCardMapel(!cardMapel)
            }}
            className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white"
          >
            Pilih Mata Pelajaran{' '}
            <i className={cardMapel ? 'fas fa-caret-up' : 'fas fa-caret-down'}></i>
          </button>
          {selectedMapelState && (
            <button
              onClick={handleShowAll}
              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Lihat Semua Guru
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {cardMapel &&
            mapelList.map((mapel) => (
              <div
                key={mapel.nama_mata_pelajaran}
                onClick={() => handleSelectMapel(mapel.nama_mata_pelajaran)}
                className={`p-4 rounded-lg shadow border transition-all duration-200 cursor-pointer
                ${
                  selectedMapelState === mapel.nama_mata_pelajaran
                    ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {mapel.nama_mata_pelajaran}
                  </h3>
                  <div className="text-lg">📘</div>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {mapel.jumlahGuru}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Guru</p>
                </div>
              </div>
            ))}

          {mapelList.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              Tidak ada data mata pelajaran
            </div>
          )}
        </div>
      </div>

      {/* Tabel Data Guru */}
      <DataTable
        data={data}
        columns={columns}
        editable={`${String(props.pattern)}`}
        pageSize={15}
        tabelName={
          selectedMapelState ? `Guru yang Mengampu ${selectedMapelState}` : 'Semua Data Guru'
        }
        placeholder="Cari guru..."
        noDataText={
          selectedMapelState
            ? `Tidak ada guru yang mengampu ${selectedMapelState}`
            : 'Tidak ada data guru'
        }
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage: guruPaginate?.lastPage,
          total: guruPaginate?.total,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      {/* Modal View Guru */}
      <ModalView
        data={dataSelected}
        exclude={['fullName', 'email', 'userId', '*id', '*guruAmpu', 'nomor']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />

      {/* Modal Import */}
      <ModalImportExcel
        open={importModal}
        onClose={() => setImportModal(false)}
        onSubmit={handleImport}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole === 'Staf') return <StafLayout>{page}</StafLayout>
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
