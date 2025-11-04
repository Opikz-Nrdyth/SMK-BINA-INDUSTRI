import React, { useEffect, useState } from 'react'
import { Staf } from './types'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import ModalImportExcel from '~/Components/modalImportExcel'

export default function Index({
  stafs,
  stafPaginate,
  searchQuery = '',
}: {
  auth: any
  stafs: Staf[]
  stafPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(stafPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(stafPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [importModal, setImportModal] = useState(false)

  useEffect(() => {
    if (!stafs) return

    const newData = [] as any
    stafs.map((item: Staf) => {
      newData.push({
        ...item,
        id: item.nip,
        fullName: item?.user?.fullName || '-',
        email: item?.user?.email || '-',
      })
    })
    setData(newData)
  }, [stafs])

  const handlePageChange = (page: number) => {
    router.get(
      `/SuperAdmin/manajemen-staf`,
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
    // Reset ke page 1 ketika search
    router.get(
      `/SuperAdmin/manajemen-staf`,
      { page: 1, search: searchTerm },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleImport = async (file: File) => {
    const formData = new FormData()
    formData.append('excel_file', file)

    router.post(`${String(props.pattern)}/import`, formData, {
      onSuccess: () => {
        setImportModal(false)
      },
    })
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Staf</h1>
        <div className="flex flex-wrap items-center lg:gap-3 gap-1">
          <button
            onClick={() => {
              setImportModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Import Staf
          </button>
          <a
            href={`${String(props.pattern)}/export`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Export Staf
          </a>
          <a
            href={`/SuperAdmin/manajemen-staf/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tambah Staf
          </a>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="Staf"
        columns={[
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
          { header: 'Departemen', accessor: 'departemen' as const },
          { header: 'Jabatan', accessor: 'jabatan' as const },
        ]}
        editable={'/SuperAdmin/manajemen-staf'}
        pageSize={15}
        placeholder="Cari staf..."
        noDataText="Tidak ada data staf"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: stafPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['fullName', 'email', 'userId', '*id', 'nomor']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />

      <ModalImportExcel
        onClose={() => {
          setImportModal(false)
        }}
        open={importModal}
        onSubmit={handleImport}
      />
    </div>
  )
}

Index.layout = (page: any) => <SuperAdminLayout>{page}</SuperAdminLayout>
