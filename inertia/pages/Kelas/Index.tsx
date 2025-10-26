import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Kelas } from './types'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  kelas,
  kelasPaginate,
  searchQuery = '',
}: {
  auth: any
  kelas: Kelas[]
  kelasPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(kelasPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(kelasPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!kelas) return

    const newData = [] as any
    kelas?.map((item: Kelas) => {
      newData.push({
        ...item,
      })
    })
    setData(newData)
  }, [kelas])

  const handlePageChange = (page: number) => {
    router.get(
      `/SuperAdmin/manajemen-kelas`,
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
      `/SuperAdmin/manajemen-kelas`,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Kelas</h1>
        <a
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
        >
          Tambah Kelas
        </a>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Jenjang', accessor: 'jenjang' as const },
          { header: 'Nama Kelas', accessor: 'namaKelas' as const },
          { header: 'Wali Kelas', accessor: 'waliName' as const },
        ]}
        editable={String(props.pattern)}
        pageSize={15}
        placeholder="Cari kelas berdasarkan nama kelas, jenjang, atau wali kelas..."
        noDataText="Tidak ada data kelas"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: kelasPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['siswa', 'guru', 'siswaData', 'guruPengampu']}
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
