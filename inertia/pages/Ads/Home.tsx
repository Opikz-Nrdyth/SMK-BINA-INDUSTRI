import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import UniversalInput from '~/Components/UniversalInput'

export default function Home({ ads, adsPaginate, searchQuery = '', filterTipe = '' }: any) {
  const { props } = usePage()
  const userRole = (props.user as any).role

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(adsPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(adsPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [tipe, setTipe] = useState(filterTipe)

  useEffect(() => {
    const newAds = ads.map((item: any) => ({
      ...item,
      aktif: item.aktif ? 'Aktif' : 'Tidak Aktif',
    }))
    setData(newAds)
  }, [ads])

  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page, search, tipe },
      { preserveState: true, replace: true }
    )
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      String(props.pattern),
      { page: 1, search: searchTerm, tipe },
      { preserveState: true, replace: true }
    )
  }

  const handleFilterTipe = (value: string) => {
    setTipe(value)
    router.get(
      String(props.pattern),
      { page: 1, search, tipe: value },
      { preserveState: true, replace: true }
    )
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Ads</h1>
        <a
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Tambah Ads
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <UniversalInput
          name="Tipe"
          value={tipe}
          onChange={(e) => {
            handleFilterTipe(e)
          }}
          type="select"
          options={[
            {
              label: 'Semua Tipe',
              value: '',
            },
            {
              label: 'Banner',
              value: 'banner',
            },
            {
              label: 'Popup',
              value: 'popup',
            },
          ]}
        />
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Judul', accessor: 'judul' as const },
          { header: 'Tipe', accessor: 'tipe' as const },
          { header: 'Aktif', accessor: 'aktif' as const },
          {
            header: 'Tanggal Mulai',
            accessor: 'tanggalMulai' as const,
            isTime: { mode: 'date', withDay: true },
          },
          {
            header: 'Tanggal Selesai',
            accessor: 'tanggalSelesai' as const,
            isTime: { mode: 'date', withDay: true },
          },
        ]}
        editable={userRole !== 'Guru' ? String(props.pattern) : ''}
        pageSize={15}
        placeholder="Cari ads..."
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: adsPaginate?.total || 0,
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

Home.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  return activeRole === 'Staf' ? (
    <StafLayout>{page}</StafLayout>
  ) : (
    <SuperAdminLayout>{page}</SuperAdminLayout>
  )
}
