import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  informasi,
  informasiPaginate,
  searchQuery = '',
}: {
  auth: any
  informasi: any[]
  informasiPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()
  const userRole = props.user.role

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(informasiPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(informasiPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!informasi) return

    const newData = [] as any
    informasi.map((item: any) => {
      newData.push({
        ...item,
      })
    })
    setData(newData)
  }, [informasi])

  const handlePageChange = (page: number) => {
    router.get(
      `/SuperAdmin/manajemen-informasi`,
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
      `/SuperAdmin/manajemen-informasi`,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Informasi</h1>
        {(userRole == 'SuperAdmin' || userRole == 'Staf') && (
          <a
            href={`${props.pattern}/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tambah Informasi
          </a>
        )}
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Judul', accessor: 'judul' as const },
          { header: 'Deskripsi', accessor: 'deskripsi' as const },
          { header: 'Role Tujuan', accessor: 'roleTujuan' as const },
          {
            header: 'Publish At',
            isTime: { mode: 'date', withDay: true },
            accessor: 'publishAt' as const,
          },
          {
            header: 'Close At',
            isTime: { mode: 'date', withDay: true },
            accessor: 'closeAt' as const,
          },
        ]}
        editable={userRole == 'SuperAdmin' || userRole == 'Staf' ? String(props.pattern) : ''}
        pageSize={15}
        placeholder="Cari informasi..."
        noDataText="Tidak ada data informasi"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: informasiPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['*id']}
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
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
