// resources/js/Pages/SiswaPraregist/Index.tsx
import { useState, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

import ModalView from '~/Components/ModalView'
import StafLayout from '~/Layouts/StafLayouts'
import { SiswaPraregist } from './typesPraRegist'

export default function Index({
  auth,
  siswas,
  siswaPaginate,
  searchQuery = '',
}: {
  auth: any
  siswas: SiswaPraregist[]
  siswaPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage() as any
  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(siswaPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(siswaPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!siswas) return

    const newData = [] as any
    siswas.map((item: SiswaPraregist) => {
      newData.push({
        ...item,
        id: item.nisn,
        fullName: item?.user?.fullName || '-',
        email: item?.user?.email || '-',
        status: item.status,
        statusBadge: item.status,
      })
    })
    setData(newData)
  }, [siswas])

  const handlePageChange = (page: number) => {
    router.get(
      `${props.pattern}`,
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
      `${props.pattern}`,
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Data Siswa Praregistrasi & Daftar Ulang
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Kelola siswa yang masih dalam proses registrasi
          </p>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="SiswaPraregist"
        columns={[
          { header: 'NISN', accessor: 'nisn' as const },
          { header: 'Nama', accessor: 'fullName' as const },
          { header: 'Email', accessor: 'email' as const },
          {
            header: 'Status',
            accessor: 'statusBadge' as const,
          },
          { header: 'Jenis Kelamin', accessor: 'jenisKelamin' as const },
          {
            header: 'Tanggal Lahir',
            isTime: { mode: 'date', withDay: true },
            accessor: 'tanggalLahir' as const,
          },
          { header: 'Sekolah Asal', accessor: 'sekolahAsal' as const },
          {
            header: 'Aksi',
            accessor: 'action' as const,
            action: (row: any) => (
              <div>
                {row.status === 'praregist' ? (
                  <button onClick={()=>{
                    router.post(`${props.pattern}/${row.nisn}/daftarulang`)
                  }} className="px-2 text-nowrap py-1 text-xs text-blue-500 font-bold hover:text-blue-600">
                    Daftar Ulang
                  </button>
                ) : row.status === 'status' ? (
                  <button onClick={()=>{
                    router.post(`${props.pattern}/${row.nisn}/daftarulang`)
                  }}  className="px-2 py-1 text-xs text-green-500 font-bold hover:text-green-600">
                    Aktifkan
                  </button>
                ) : null}
              </div>
            ),
          },
        ]}
        pageSize={15}
        placeholder="Cari siswa praregist..."
        noDataText="Tidak ada data siswa praregistrasi"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: siswaPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        viewModal
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['fullName', 'email', 'userId', '*id', '*updatedAt', '*createdAt']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  if (page.props.user.role == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
