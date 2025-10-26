import React, { useEffect, useState } from 'react'
import { usePage, router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

export default function Index({
  auth,
  blogs,
  blogsPaginate,
  kategoriList,
  searchQuery = '',
  filterKategori = '',
  filterStatus = '',
}: {
  auth: any
  blogs: any[]
  blogsPaginate: any
  kategoriList: string[]
  searchQuery?: string
  filterKategori?: string
  filterStatus?: string
}) {
  const { props } = usePage()
  const userRole = props.user.role

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(blogsPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(blogsPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [kategori, setKategori] = useState(filterKategori)
  const [status, setStatus] = useState(filterStatus)

  useEffect(() => {
    if (!blogs) return

    const newData = [] as any
    blogs.map((item: any) => {
      newData.push({
        ...item,
        penulis: item.penulis?.fullName || 'Unknown',
      })
    })
    setData(newData)
  }, [blogs])

  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page, search, kategori, status },
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
      { page: 1, search: searchTerm, kategori, status },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleFilterKategori = (value: string) => {
    setKategori(value)
    router.get(
      String(props.pattern),
      { page: 1, search, kategori: value, status },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleFilterStatus = (value: string) => {
    setStatus(value)
    router.get(
      String(props.pattern),
      { page: 1, search, kategori, status: value },
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen Blog</h1>
        <a
          href={`${String(props.pattern)}/create`}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Tambah Blog
        </a>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kategori
          </label>
          <select
            value={kategori}
            onChange={(e) => handleFilterKategori(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Semua Kategori</option>
            {kategoriList.map((kat) => (
              <option key={kat} value={kat}>
                {kat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => handleFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <DataTable
        data={data}
        columns={[
          { header: 'Judul', accessor: 'judul' as const },
          { header: 'Penulis', accessor: 'penulis' as const },
          { header: 'Kategori', accessor: 'kategori' as const },
          { header: 'Status', accessor: 'status' as const },
          { header: 'Dilihat', accessor: 'dilihat' as const },
          {
            header: 'Published At',
            accessor: 'publishedAt' as const,
          },
        ]}
        editable={userRole === 'SuperAdmin' || userRole === 'Staf' ? String(props.pattern) : ''}
        pageSize={15}
        placeholder="Cari blog..."
        noDataText="Tidak ada data blog"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: blogsPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      <ModalView
        data={dataSelected}
        exclude={['*id', 'penulisId', 'slug']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole === 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
