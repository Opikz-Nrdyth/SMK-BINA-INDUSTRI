import { useState, useEffect } from 'react'
import { router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Siswa } from './types'
import ModalView from '~/Components/ModalView'
import StafLayout from '~/Layouts/StafLayouts'
import ModalImportExcel from '~/Components/modalImportExcel'

export default function Index({
  auth,
  siswas,
  siswaPaginate,
  searchQuery = '',
}: {
  auth: any
  siswas: Siswa[]
  siswaPaginate: any
  searchQuery?: string
}) {
  const { props } = usePage()
  const [importModal, setImportModal] = useState(false)
  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(siswaPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(siswaPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  useEffect(() => {
    if (!siswas) return

    const newData = [] as any
    siswas.map((item: Siswa) => {
      newData.push({
        ...item,
        id: item.nisn,
        fullName: item?.user?.fullName || '-',
        email: item?.user?.email || '-',
      })
    })
    setData(newData)
  }, [siswas])

  const handlePageChange = (page: number) => {
    router.get(
      props.pattern ? String(props.pattern) : `/SuperAdmin/manajemen-siswa`,
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
      props.pattern ? String(props.pattern) : `/SuperAdmin/manajemen-siswa`,
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Siswa</h1>
        <div className="flex flex-wrap items-center lg:gap-3 gap-1">
          <a
            href={`${String(props.pattern)}/kelas`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Lihat per kelas
          </a>
          <a
            href={`${String(props.pattern)}/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tambah Siswa
          </a>
          <button
            onClick={() => {
              setImportModal(true)
            }}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Import Siswa
          </button>
          <a
            href={`${String(props.pattern)}/export`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Export Siswa
          </a>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="Siswa"
        columns={[
          { header: 'No', accessor: 'nomor' as const },
          { header: 'NISN', accessor: 'nisn' as const },
          { header: 'Nama', accessor: 'fullName' as const, sort: 'fullName' },
          { header: 'Email', accessor: 'email' as const },
          { header: 'Jenis Kelamin', accessor: 'jenisKelamin' as const },
          {
            header: 'Tanggal Lahir',
            isTime: { mode: 'date', withDay: true },
            accessor: 'tanggalLahir' as const,
          },
          { header: 'Sekolah Asal', accessor: 'sekolahAsal' as const },
        ]}
        editable={String(props.pattern)}
        pageSize={15}
        placeholder="Cari siswa..."
        noDataText="Tidak ada data siswa"
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

      {props.route == 'guru_siswa.index' ? (
        <ModalView
          data={dataSelected}
          include={[
            'fullName',
            'nisn',
            'jenisKelamin',
            'tempatLahir',
            'tanggalLahir',
            'agama',
            'nama_kelas',
          ]}
          open={!!dataSelected}
          onClose={() => setDataSelected(null)}
        />
      ) : (
        <ModalView
          data={dataSelected}
          exclude={[
            'fullName',
            '*id',
            'email',
            'userId',
            '*id',
            '*updatedAt',
            '*createdAt',
            'nomor',
          ]}
          open={!!dataSelected}
          onClose={() => setDataSelected(null)}
        />
      )}

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

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
