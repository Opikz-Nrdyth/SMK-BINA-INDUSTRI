import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { TahunAjaran } from './types'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  tahunAjarans,
  tahunAjaranPaginate,
  searchQuery = '',
}: {
  auth: any
  tahunAjarans: TahunAjaran[]
  tahunAjaranPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(tahunAjaranPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(tahunAjaranPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!tahunAjarans) return

    const newData = [] as any
    tahunAjarans?.forEach((item: any) => {
      newData.push({
        ...item,
        kepalaSekolah: item.kepalaSekolahName,
      })
    })
    setData(newData)
  }, [tahunAjarans])

  const handlePageChange = (page: number) => {
    router.get(
      `/${String(props.pattern)}`,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Tahun Ajaran</h1>
        <a
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Tambah Tahun Ajaran
        </a>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Kode TA', accessor: 'kodeTa' as const },
          { header: 'Tahun Ajaran', accessor: 'tahunAjaran' as const },
          { header: 'Kepala Sekolah', accessor: 'kepalaSekolah' as const },
        ]}
        editable={String(props.pattern)}
        pageSize={15}
        placeholder="Cari tahun ajaran berdasarkan kode, tahun ajaran, atau kepala sekolah..."
        noDataText="Tidak ada data tahun ajaran"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: tahunAjaranPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['user', 'kepalaSekolahData']}
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
