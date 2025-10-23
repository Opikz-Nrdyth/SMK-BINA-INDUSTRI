// File: SuperAdminPage.tsx
import React, { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import DataTable, { TableColumn } from '~/Components/TabelData'
import UniversalInput from '~/Components/UniversalInput'
import { timeFormat } from '~/Components/FormatWaktu'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

// Type untuk User/Super Admin
type User = {
  id: number
  fullName: string
  email: string
  role: string
  createdAt: string
  status: 'active' | 'inactive'
}

// Komponen utama untuk manajemen Super Admin
export default function SuperAdminPage({
  users,
  userPaginate,
  searchQuery,
}: {
  users: User[]
  userPaginate: any
  searchQuery: any
}) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [payload, setPayload] = useState({
    fullName: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const [currentPage, setCurrentPage] = useState(userPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(userPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)

  const { props } = usePage()

  const handlePageChange = (page: number) => {
    router.get(String(props.pattern), { page, search }, { preserveState: true, replace: true })
    setCurrentPage(page)
  }

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm)
    router.get(
      String(props.pattern),
      { page: 1, search: searchTerm },
      { preserveState: true, replace: true }
    )
  }
  // Kolom tabel untuk Super Admin
  const columns: TableColumn<User>[] = [
    {
      header: 'Nama',
      accessor: 'fullName',
      className: 'font-medium',
    },
    {
      header: 'Email',
      accessor: 'email',
      className: 'text-gray-600 dark:text-gray-400',
    },
    {
      header: 'Role',
      accessor: 'role',
      badge: 'blue',
    },
    {
      header: 'Tanggal Dibuat',
      accessor: 'createdAt',
      isTime: { mode: 'date', withDay: true },
      hideMobile: true,
    },
  ]

  const handleRowClick = (user: User) => {
    setSelectedUser(user)
  }

  const handleAddSuperAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    router.post('/SuperAdmin/data-super-admin/store', payload, {
      onSuccess: () => {
        setShowAddModal(false)
        setPayload({
          fullName: '',
          email: '',
          password: '',
          password_confirmation: '',
        })
      },
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="mx-auto lg:p-6">
      {/* Header dengan tombol tambah */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Super Admin</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium"
        >
          Tambah Super Admin
        </button>
      </div>

      {/* Tabel Data Super Admin */}
      <DataTable
        data={users}
        columns={columns}
        tabelName="Super Admin"
        placeholder="Cari nama atau email..."
        editable="/SuperAdmin/data-super-admin"
        viewModal={true}
        onRowClick={handleRowClick}
        disableConfig={{
          canDelete: (row) => row.id !== props.user.id,
          canEdit: (row) => row.id === null,
        }}
        serverPagination={{
          currentPage,
          lastPage,
          total: userPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
      />

      {/* Modal Tambah Super Admin */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Tambah Super Admin Baru
            </h2>

            <form onSubmit={handleAddSuperAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nama Lengkap
                </label>
                <UniversalInput
                  name="nama"
                  type="text"
                  value={payload.fullName}
                  onChange={(e) => handleInputChange('fullName', e)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <UniversalInput
                  name="email"
                  type="email"
                  value={payload.email}
                  onChange={(e) => handleInputChange('email', e)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <UniversalInput
                  name="password"
                  type="password"
                  value={payload.password}
                  onChange={(e) => handleInputChange('password', e)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Konfirmasi Password
                </label>
                <UniversalInput
                  name="confirm-password"
                  type="password"
                  value={payload.password_confirmation}
                  onChange={(e) => handleInputChange('password_confirmation', e)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail Super Admin */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Detail Super Admin
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nama
                </label>
                <p className="text-gray-800 dark:text-white">{selectedUser.fullName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <p className="text-gray-800 dark:text-white">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                  Tanggal Dibuat
                </label>
                <p className="text-gray-800 dark:text-white">
                  {timeFormat(selectedUser.createdAt, { mode: 'date', withDay: true })}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

SuperAdminPage.layout = (page: any) => (
  <SuperAdminLayout title="Manajemen Super Admin">{page}</SuperAdminLayout>
)
