import React, { useEffect, useState } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import UniversalInput from '~/Components/UniversalInput'

export default function Index({
  aktivitas,
  aktivitasPaginate,
  searchQuery = '',
  filterStatus = '',
}: any) {
  const { props } = usePage()
  const userRole = props.user.role

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(aktivitasPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(aktivitasPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [status, setStatus] = useState(filterStatus)

  useEffect(() => {
    setData(aktivitas)
  }, [aktivitas])

  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page, search, status },
      { preserveState: true, replace: true }
    )
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      String(props.pattern),
      { page: 1, search: searchTerm, status },
      { preserveState: true, replace: true }
    )
  }

  const handleFilterStatus = (value: string) => {
    setStatus(value)
    router.get(
      String(props.pattern),
      { page: 1, search, status: value },
      { preserveState: true, replace: true }
    )
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Aktivitas</h1>
        <Link
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Tambah Aktivitas
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <UniversalInput
          type="select"
          name="status"
          value={status}
          onChange={(e) => handleFilterStatus(e)}
          options={[
            {
              label: 'Semua',
              value: '',
            },
            {
              label: 'Draft',
              value: 'draft',
            },
            {
              label: 'Published',
              value: 'published',
            },
          ]}
        />
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Nama', accessor: 'nama' as const },
          { header: 'Jenis', accessor: 'jenis' as const },
          { header: 'Lokasi', accessor: 'lokasi' as const },
          {
            header: 'Tanggal',
            accessor: 'tanggalPelaksanaan' as const,
            isTime: { mode: 'date', withDay: true },
          },
          { header: 'Status', accessor: 'status' as const },
        ]}
        editable={userRole !== 'Guru' ? String(props.pattern) : ''}
        pageSize={15}
        placeholder="Cari aktivitas..."
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: aktivitasPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['*id', 'createdBy']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  return activeRole === 'Staf' ? (
    <StafLayout>{page}</StafLayout>
  ) : (
    <SuperAdminLayout>{page}</SuperAdminLayout>
  )
}
