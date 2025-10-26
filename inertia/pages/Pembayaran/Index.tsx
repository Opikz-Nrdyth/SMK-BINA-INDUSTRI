import React, { useEffect, useState } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import WhatsappMessagePopup from '~/Components/WhatsappMessagePopup'

export default function Index({
  auth,
  pembayarans,
  pembayaranPaginate,
  filter,
  searchQuery = '',
}: {
  auth: any
  pembayarans: any[]
  pembayaranPaginate: any
  filter: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(pembayaranPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(pembayaranPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [selectedRow, setSelectedRow] = useState(null)
  const [showPopup, setShowPopup] = useState(false)

  const [currentFilter, setCurrentFilter] = useState({
    search: filter?.search || '',
    jenisPembayaran: filter?.jenisPembayaran || '',
    tanggal: filter?.tanggal || '',
  })

  useEffect(() => {
    if (!pembayarans) return

    const newData = [] as any
    pembayarans?.forEach((item: any) => {
      newData.push({
        id: item.id,
        siswa: item.userName,
        jenisPembayaran: item.jenisPembayaran,
        nominalPenetapan: formatRupiah(item.nominalPenetapan),
        totalDibayar: formatRupiah(item.totalDibayar),
        sisaPembayaran: formatRupiah(item.sisaPembayaran),
        status: item.lunas ? 'Lunas' : 'Belum Lunas',
        createdAt: item.createdAt,
        noTelepon: item.user.dataSiswa.noTelepon,
        // Data untuk modal view
        detailData: {
          id: item.id,
          siswa: item.userName,
          jenisPembayaran: item.jenisPembayaran,
          nominalPenetapan: formatRupiah(item.nominalPenetapan),
          totalDibayar: formatRupiah(item.totalDibayar),
          sisaPembayaran: formatRupiah(item.sisaPembayaran),
          status: item.lunas ? 'Lunas' : 'Belum Lunas',
          tanggalDibuat: item.createdAt,
          riwayatPembayaran: item.riwayatPembayaran || [],
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
      String(props.pattern),
      { page, ...currentFilter, search },
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
      String(props.pattern),
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
        String(props.pattern),
        { ...newFilter, search },
        {
          preserveState: true,
          replace: true,
        }
      )
    }, 500)
  }

  const jenisPembayaranOptions = [
    'SPP',
    'Uang Bangunan',
    'Uang Seragam',
    'Uang Kegiatan',
    'Uang Buku',
    'Lainnya',
  ]

  // Format data untuk modal view
  const getModalData = (item: any) => {
    if (!item?.detailData) return {}

    const modalData: any = {
      informasiPembayaran: {
        siswa: item.detailData.siswa,
        jenisPembayaran: item.detailData.jenisPembayaran,
        nominalPenetapan: item.detailData.nominalPenetapan,
        totalDibayar: item.detailData.totalDibayar,
        sisaPembayaran: item.detailData.sisaPembayaran,
        status: item.detailData.status,
        tanggalDibuat: item.detailData.tanggalDibuat,
      },
    }

    // Tambahkan riwayat pembayaran jika ada
    if (item.detailData.riwayatPembayaran && item.detailData.riwayatPembayaran.length > 0) {
      modalData.riwayatPembayaran = item.detailData.riwayatPembayaran.map(
        (pembayaran: any, index: number) => ({
          tanggal: pembayaran.tanggal,
          nominal: formatRupiah(parseFloat(pembayaran.nominal)),
          urutan: index + 1,
        })
      )
    }

    return modalData
  }

  const handleWhatsapp = (pesan: any) => {
    const payload = {
      number: selectedRow?.noTelepon,
      message: pesan,
    }

    router.post('/api/whatsapp/send-message', payload)
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {showPopup && (
        <WhatsappMessagePopup
          row={selectedRow}
          onClose={() => setShowPopup(false)}
          onSend={(pesan: any) => {
            setShowPopup(false)
            handleWhatsapp(pesan)
          }}
        />
      )}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Pembayaran</h1>
        {(props.user as any).role != 'Guru' && (
          <div className="flex flex-wrap items-center lg::gap-3 gap-1">
            <Link
              href={`${props.pattern}/create`}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
            >
              Tambah Pembayaran
            </Link>
            <button
              onClick={() => {
                router.post('/api/whatsapp/initialize')
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              Initiasi Whatsapp
            </button>
          </div>
        )}
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-purple-200 dark:border-purple-800">
        <div className="flex justify-between items-center">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={currentFilter.tanggal}
                onChange={(e) => handleFilterChange('tanggal', e.target.value)}
                className="block w-full pl-3 border pr-10 py-2 text-base dark:text-gray-50 border-purple-300 dark:bg-gray-700 dark:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md transition-colors duration-200"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setCurrentFilter({ search: '', jenisPembayaran: '', tanggal: '' })
                setSearch('')
                router.get(String(props.pattern), {}, { preserveState: true })
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Reset Filter
            </button>
          </div>
        </div>
      </div>

      {(props.user as any).role == 'Guru' ? (
        <DataTable
          data={data}
          tabelName="Pembayaran"
          columns={[
            { header: 'Siswa', accessor: 'siswa' as const },
            { header: 'Jenis Pembayaran', accessor: 'jenisPembayaran' as const },
            { header: 'Nominal Penetapan', accessor: 'nominalPenetapan' as const },
            { header: 'Total Dibayar', accessor: 'totalDibayar' as const },
            { header: 'Sisa Pembayaran', accessor: 'sisaPembayaran' as const },
            {
              header: 'Status',
              accessor: 'status' as const,
            },
          ]}
          pageSize={15}
          placeholder="Cari pembayaran berdasarkan nama siswa..."
          noDataText="Tidak ada data pembayaran"
          onRowClick={(value: any) => setDataSelected(value)}
          serverPagination={{
            currentPage,
            lastPage,
            total: pembayaranPaginate?.total || 0,
            onPageChange: handlePageChange,
          }}
          serverSearch={{
            value: search,
            onChange: handleSearch,
          }}
        />
      ) : (
        <DataTable
          data={data}
          tabelName="Pembayaran"
          columns={[
            { header: 'Siswa', accessor: 'siswa' as const },
            { header: 'Jenis Pembayaran', accessor: 'jenisPembayaran' as const },
            { header: 'Nominal Penetapan', accessor: 'nominalPenetapan' as const },
            { header: 'Total Dibayar', accessor: 'totalDibayar' as const },
            { header: 'Sisa Pembayaran', accessor: 'sisaPembayaran' as const },
            {
              header: 'Status',
              accessor: 'status' as const,
            },
            {
              header: 'Cetak',
              accessor: 'id',
              action: (row: any) => (
                <>
                  <Link
                    href={`${props.pattern}/${row.id}/cetak`}
                    className="text-purple-600 hover:text-purple-800 px-2 py-1 rounded-md flex items-center gap-1 transition-colors duration-200"
                  >
                    <i className="fas fa-print"></i>
                    Cetak
                  </Link>
                  {row.status == 'Belum Lunas' && (
                    <button
                      onClick={() => {
                        setSelectedRow(row)
                        setShowPopup(true)
                      }}
                      className="text-green-600 hover:text-green-800 px-2 py-1 rounded-md flex items-center gap-1 transition-colors duration-200"
                    >
                      <i className="fa-brands fa-whatsapp"></i> Whatsapp
                    </button>
                  )}
                </>
              ),
            },
          ]}
          editable={String(props.pattern)}
          pageSize={15}
          placeholder="Cari pembayaran berdasarkan nama siswa..."
          noDataText="Tidak ada data pembayaran"
          onRowClick={(value: any) => setDataSelected(value)}
          serverPagination={{
            currentPage,
            lastPage,
            total: pembayaranPaginate?.total || 0,
            onPageChange: handlePageChange,
          }}
          serverSearch={{
            value: search,
            onChange: handleSearch,
          }}
        />
      )}

      <ModalView
        data={getModalData(dataSelected)}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
        title="Detail Pembayaran"
        exclude={[]}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
