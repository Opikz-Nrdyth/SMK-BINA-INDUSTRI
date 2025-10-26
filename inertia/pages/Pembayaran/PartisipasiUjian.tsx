import React, { useEffect, useState } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'

export default function PartisipasiUjian({
  auth,
  pembayarans,
  pagination,
  filters,
}: {
  auth: any
  pembayarans: any[]
  pagination: any
  filters: any
}) {
  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(pagination?.currentPage || 1)
  const [lastPage, setLastPage] = useState(pagination?.lastPage || 1)
  const [currentFilter, setCurrentFilter] = useState({
    search: filters?.search || '',
    jenisPembayaran: filters?.jenisPembayaran || '',
  })

  useEffect(() => {
    if (!pembayarans) return

    const newData = [] as any
    pembayarans?.forEach((item: any) => {
      newData.push({
        id: item.id,
        siswa: item.userName,
        nisn: item.nisn || '-',
        jenisPembayaran: item.jenisPembayaran,
        nominalPenetapan: formatRupiah(item.nominalPenetapan),
        totalDibayar: formatRupiah(item.totalDibayar),
        sisaPembayaran: formatRupiah(item.sisaPembayaran),
        statusPartisipasi: item.partisipasiUjian ? 'Diizinkan' : 'Tidak Diizinkan',
        // Data untuk modal view
        detailData: {
          id: item.id,
          siswa: item.userName,
          nisn: item.nisn || '-',
          jenisPembayaran: item.jenisPembayaran,
          nominalPenetapan: formatRupiah(item.nominalPenetapan),
          totalDibayar: formatRupiah(item.totalDibayar),
          sisaPembayaran: formatRupiah(item.sisaPembayaran),
          statusPartisipasi: item.partisipasiUjian ? 'Diizinkan' : 'Tidak Diizinkan',
          partisipasiUjian: item.partisipasiUjian,
          createdAt: item.createdAt,
        },
      })
    })
    setData(newData)
  }, [pembayarans])

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePageChange = (page: number) => {
    router.get(
      url,
      { page, ...currentFilter },
      {
        preserveState: true,
        replace: true,
      }
    )
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    router.get(
      url,
      { page: 1, ...currentFilter, search: searchTerm },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilter = { ...currentFilter, [key]: value }
    setCurrentFilter(newFilter)

    // Debounced filter update
    setTimeout(() => {
      router.get(
        url,
        { ...newFilter },
        {
          preserveState: true,
          replace: true,
        }
      )
    }, 500)
  }

  const togglePartisipasi = (pembayaranId: string, currentStatus: boolean) => {
    router.post(
      `${url}/update-partisipasi-ujian`,
      {
        pembayaranId,
        partisipasiUjian: !currentStatus,
      },
      {
        preserveScroll: true,
      }
    )
  }

  const handleBulkAction = (action: string, selectedIds: string[]) => {
    if (!action || selectedIds.length === 0) return

    router.post(
      `${url}/bulk-update-partisipasi-ujian`,
      {
        action,
        selectedIds,
      },
      {
        preserveScroll: true,
      }
    )
  }

  const jenisPembayaranOptions = ['SPP', 'Uang Pangkal', 'Uang Daftar Ulang']

  // Format data untuk modal view
  const getModalData = (item: any) => {
    if (!item?.detailData) return {}

    const modalData: any = {
      informasiPembayaran: {
        siswa: item.detailData.siswa,
        nisn: item.detailData.nisn,
        jenisPembayaran: item.detailData.jenisPembayaran,
        nominalPenetapan: item.detailData.nominalPenetapan,
        totalDibayar: item.detailData.totalDibayar,
        sisaPembayaran: item.detailData.sisaPembayaran,
        statusPartisipasi: item.detailData.statusPartisipasi,
        tanggalDibuat: item.detailData.createdAt,
      },
    }

    return modalData
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const isDiizinkan = status === 'Diizinkan'
    return (
      <span
        className={`inline-flex text-nowrap px-2 py-1 text-xs font-semibold rounded-full ${
          isDiizinkan ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}
      >
        {status}
      </span>
    )
  }

  const ActionButton = ({ row }: { row: any }) => {
    const isDiizinkan = row.detailData?.partisipasiUjian

    return (
      <button
        onClick={() => togglePartisipasi(row.id, isDiizinkan)}
        className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isDiizinkan
            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isDiizinkan ? 'Tolak' : 'Izinkan'}
      </button>
    )
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kelola Partisipasi Ujian
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Hanya menampilkan siswa dengan pembayaran belum lunas
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-purple-200 dark:border-purple-800">
        <div className="flex flex-col md:flex-row gap-1 justify-between items-center">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                Jenis Pembayaran
              </label>
              <select
                value={currentFilter.jenisPembayaran}
                onChange={(e) => handleFilterChange('jenisPembayaran', e.target.value)}
                className="block w-full pl-3 pr-10 py-2 border text-base dark:text-gray-50 border-purple-300 dark:bg-gray-700 dark:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md transition-colors duration-200"
              >
                <option value="">Semua Jenis</option>
                {jenisPembayaranOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setCurrentFilter({ search: '', jenisPembayaran: '' })
                router.get(url, {}, { preserveState: true })
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="Siswa Belum Lunas"
        columns={[
          { header: 'Nama Siswa', accessor: 'siswa' as const },
          { header: 'NISN', accessor: 'nisn' as const },
          { header: 'Jenis Pembayaran', accessor: 'jenisPembayaran' as const },
          { header: 'Nominal Penetapan', accessor: 'nominalPenetapan' as const },
          { header: 'Total Dibayar', accessor: 'totalDibayar' as const },
          { header: 'Sisa Pembayaran', accessor: 'sisaPembayaran' as const },
          {
            header: 'Status Partisipasi',
            accessor: 'statusPartisipasi' as const,
            action: (row: any) => <StatusBadge status={row.statusPartisipasi} />,
          },
          {
            header: 'Aksi',
            accessor: 'id',
            action: (row: any) => <ActionButton row={row} />,
          },
        ]}
        pageSize={15}
        placeholder="Cari siswa berdasarkan nama..."
        noDataText="Tidak ada data siswa dengan pembayaran belum lunas"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: pagination?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: currentFilter.search,
          onChange: handleSearch,
        }}
        viewModal={true}
      />

      <ModalView
        data={getModalData(dataSelected)}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
        title="Detail Pembayaran Siswa"
        exclude={[]}
      />
    </div>
  )
}

PartisipasiUjian.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
