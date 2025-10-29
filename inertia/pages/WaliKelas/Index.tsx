import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  waliKelas,
  waliKelasPaginate,
  searchQuery = '',
}: {
  auth: any
  waliKelas: any
  waliKelasPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(waliKelasPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(waliKelasPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!waliKelas) return

    const newData = [] as any
    waliKelas.map((item: any) => {
      newData.push({
        ...item,
        id: item.nip, // Menggunakan nip sebagai ID
        fullName: item?.user?.fullName || '-',
        email: item?.user?.email || '-',
        namaKelas: item?.waliKelas?.namaKelas || '-',
        gelar:
          `${item?.gelarDepan || ''} ${item?.user?.fullName || ''} ${item?.gelarBelakang || ''}`.trim(),
        KelasAmpu: item.waliKelas,
      })
    })
    setData(newData)
  }, [waliKelas])

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
    // Reset ke page 1 ketika search
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

  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}`

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Wali Kelas</h1>
        <a
          href={`${url}/manajemen-kelas`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Tambah Wali Kelas
        </a>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'NIP', accessor: 'nip' as const },
          { header: 'Nama', accessor: 'fullName' as const },
          { header: 'Email', accessor: 'email' as const },
          { header: 'Jenis Kelamin', accessor: 'jenisKelamin' as const },
          { header: 'Wali Kelas', accessor: 'namaKelas' as const },
        ]}
        pageSize={15}
        placeholder="Cari wali kelas berdasarkan NIP, nama, email, jenis kelamin, atau kelas..."
        noDataText="Tidak ada data wali kelas"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: waliKelasPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
        viewModal
      />

      <ModalView
        data={dataSelected}
        exclude={[
          'user',
          'userId',
          '*id',
          'KelasAmpu.waliKelas',
          'fullName',
          'email',
          'namaKelas',
          'waliKelas',
          'KelasAmpu.siswa',
        ]}
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
