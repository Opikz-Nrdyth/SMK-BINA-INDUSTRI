import React, { useState } from 'react'
import { router, usePage } from '@inertiajs/react'
import StafLayout from '~/Layouts/StafLayouts'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import DataTable, { TableColumn } from '~/Components/TabelData'

export default function Index({ dataPasswords, bankSoals, pagination, searchQuery }: any) {
  const [showModal, setShowModal] = useState(false)
  const [password, setPassword] = useState('')
  const [selectedBank, setSelectedBank] = useState<number[]>([])
  const { props } = usePage() as any

  const toggleBank = (id: number) => {
    setSelectedBank((prev) => (prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.post(props.pattern, { password, ujian: selectedBank })
    setShowModal(false)
    setPassword('')
    setSelectedBank([])
  }

  const handlePageChange = (page: number) => {
    router.get(props.pattern, { page, search: searchQuery }, { preserveScroll: true })
  }

  const handleSearch = (value: string) => {
    router.get(props.pattern, { search: value }, { preserveScroll: true })
  }

  const columns: TableColumn<any>[] = [
    { header: 'No', accessor: 'nomor', sort: 'nomor' },
    { header: 'Kode Ujian', accessor: 'kode', className: 'font-mono' },
    { header: 'Ujian', accessor: 'ujianNames', className: 'truncate max-w-[350px]' },
    { header: 'Mapel', accessor: 'mapel' },
    { header: 'Kelas', accessor: 'jenjang' },
  ]

  return (
    <div className="p-6 relative text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Data Password</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          + Tambah Password
        </button>
      </div>

      {/* Table */}
      <DataTable
        data={dataPasswords}
        columns={columns}
        onRowClick={() => {}}
        tabelName="Password"
        placeholder="Cari kode..."
        noDataText="Belum ada data kode ujian."
        editable={props.pattern}
        serverPagination={{
          currentPage: pagination.currentPage,
          lastPage: pagination.lastPage,
          total: pagination.total,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: searchQuery || '',
          onChange: handleSearch,
        }}
        disableConfig={{
          canEdit: () => false,
          canView: () => false,
          canDelete: () => true,
        }}
      />

      {/* Modal Tambah */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative transition duration-200">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Tambah Data Password
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  className="border border-gray-300 dark:border-gray-600 rounded-md w-full px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none dark:bg-gray-700 dark:text-gray-100"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Checkbox Bank Soal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pilih Bank Soal
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 p-2 rounded-md dark:bg-gray-700">
                  {bankSoals.map((b: any) => (
                    <label
                      key={b.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/40 px-2 py-1 rounded-md transition"
                    >
                      <input
                        type="checkbox"
                        className="accent-purple-600 dark:accent-purple-500"
                        checked={selectedBank.includes(b.id)}
                        onChange={() => toggleBank(b.id)}
                      />
                      <span className="text-gray-700 dark:text-gray-200 text-sm">
                        {b.namaUjian} ({b.jenjang} - {b?.mapel?.namaMataPelajaran})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-md transition dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
