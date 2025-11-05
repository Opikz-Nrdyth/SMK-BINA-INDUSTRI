import { useState, useEffect } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import DataTable from '~/Components/TabelData'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { BankSoal } from './types'
import ModalView from '~/Components/ModalView'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface IndexProps {
  auth: any
  bankSoals: BankSoal[]
  bankSoalPaginate: any
  searchQuery?: string
}

export default function Index({ bankSoals, bankSoalPaginate, searchQuery = '', auth }: IndexProps) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(bankSoalPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(bankSoalPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  const urlPage = props.pattern

  useEffect(() => {
    if (!bankSoals) return

    const newData = [] as any
    bankSoals.map((item: BankSoal) => {
      newData.push({
        ...item,
        id: item.id,
        jurusan: item.jurusanDetails?.join(', ') || '-',
        penulis: item.penulisDetails?.join(', ') || '-',
        mapel: item.mapelDetails?.join(', ') || '-',
        kode: item.kode || '-',
      })
    })
    setData(newData)
  }, [bankSoals])

  const handlePageChange = (page: number) => {
    router.get(
      String(urlPage),
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
      String(urlPage),
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Bank Soal</h1>
        <div className="flex gap-1 items-center">
          <Link
            href={`${urlPage}/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Tambah Bank Soal
          </Link>
          <Link
            href={`${urlPage}/data-password`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Data Password
          </Link>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="BankSoal"
        columns={[
          { header: 'Jenis Ujian', accessor: 'jenisUjian' as const },
          { header: 'Nama Ujian', accessor: 'namaUjian' as const },
          { header: 'Kode Ujian', accessor: 'kode' as const },
          { header: 'Jenjang', accessor: 'jenjang' as const },
          { header: 'Mata Pelajaran', accessor: 'mapel' as const },
          { header: 'Jurusan', accessor: 'jurusan' as const },
          { header: 'Penulis', accessor: 'penulis' as const },
          { header: 'Waktu (menit)', accessor: 'waktu' as const },
          {
            header: 'Tanggal Ujian',
            isTime: { mode: 'date', withDay: true },
            accessor: 'tanggalUjian' as const,
          },
          {
            header: 'Aksi',
            accessor: 'actions' as const,
            action: (row: any) => (
              <Link
                className="text-blue-600 font-bold hover:underline text-nowrap"
                href={`${urlPage}/${row.id}/edit-soal`}
              >
                Edit Soal
              </Link>
            ),
          },
        ]}
        editable={String(urlPage)}
        pageSize={15}
        placeholder="Cari bank soal berdasarkan kode, nama ujian, jenjang, atau jenis ujian..."
        noDataText="Tidak ada data bank soal"
        disableConfig={{
          canEdit: () => {
            return true
          },
          canDelete: () => {
            return true
          },
          canView: () => true,
          disabledMessage: 'Guru hanya dapat mengubah Ujian Mandiri yang dibuat sendiri',
        }}
        onRowClick={(value: any) =>
          setDataSelected(() => ({
            ...value,
            mapel: value.mapelDetails?.[0],
            diBuat: value.createdAt,
            diUpdate: value.updatedAt,
          }))
        }
        serverPagination={{
          currentPage,
          lastPage,
          total: bankSoalPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={[
          '*id',
          'soalFile',
          'jurusanDetails',
          'penulisDetails',
          'mapelDetails',
          'mapelId',
          'createdAt',
          'updatedAt',
          'jurusan',
          'penulis',
          'mapel',
        ]}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
        title="Detail Bank Soal"
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
