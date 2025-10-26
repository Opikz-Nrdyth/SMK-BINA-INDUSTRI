import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Jurusan } from './types'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  jurusan,
  jurusanPaginate,
  searchQuery = '',
}: {
  auth: any
  jurusan: Jurusan[]
  jurusanPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(jurusanPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(jurusanPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!jurusan) return

    const newData = [] as any
    jurusan?.map((item: Jurusan) => {
      newData.push({
        ...item,
      })
    })
    setData(newData)
  }, [jurusan])

  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page },
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
      { page: 1, search: searchTerm },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Jurusan</h1>
        <a
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Tambah Jurusan
        </a>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Kode Jurusan', accessor: 'kodeJurusan' as const },
          { header: 'Nama Jurusan', accessor: 'namaJurusan' as const },
          { header: 'Akreditasi', accessor: 'akreditasi' as const },
        ]}
        editable={String(props.pattern)}
        pageSize={15}
        placeholder="Cari jurusan berdasarkan kode, nama, atau akreditasi..."
        noDataText="Tidak ada data jurusan"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: jurusanPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['*id', 'kelasId', 'dataKelas.siswa', '*waliKelas']}
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
