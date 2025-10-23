import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { timeFormat } from './FormatWaktu'
import { Link, router } from '@inertiajs/react'
import { ConfirmModal } from './Confirm'
import { useNotification } from './NotificationAlert'

type timeFormat = {
  mode?: 'date' | 'time' | 'datetime'
  withDay?: boolean
}

export type TableColumn<T> = {
  header: string
  accessor: keyof T
  className?: string
  hideMobile?: boolean
  isTime?: timeFormat
  badge?: 'green' | 'red' | 'yellow' | 'blue' | 'grey'
  action?: (row: T) => ReactNode | null
}

type DataTableProps<T> = {
  data: T[]
  columns: TableColumn<T>[]
  pageSize?: number
  placeholder?: string
  tabelName?: string
  noDataText?: string
  editable?: string
  viewModal?: boolean
  onRowClick: (value: any) => void
  serverPagination?: {
    currentPage: number
    lastPage: number
    total: number
    onPageChange: (page: number) => void
  }
  serverSearch?: {
    value: string
    onChange: (value: string) => void
  }

  disableConfig?: {
    canEdit?: (row: T) => boolean
    canDelete?: (row: T) => boolean
    canView?: (row: T) => boolean
    disabledMessage?: string
  }
}

/**
 * DataTable generik: search, pagination, dark-mode, responsif
 * @param data        array of objects
 * @param columns     definisi kolom
 * @param pageSize    baris per halaman (default 10)
 * @param placeholder placeholder input search
 * @param noDataText  teks jika data kosong
 */
export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 15,
  placeholder = 'Search...',
  tabelName = 'Data',
  noDataText = 'No data found.',
  editable = '',
  viewModal = false,
  onRowClick,
  serverPagination,
  serverSearch,
  disableConfig,
}: DataTableProps<T>) {
  const [search, setSearch] = useState(serverSearch?.value || '')
  const [page, setPage] = useState(serverPagination?.currentPage || 1)
  const [deleteId, setDeleteId] = useState<any | null>(null)

  useEffect(() => {
    if (serverSearch) {
      setSearch(serverSearch.value)
    }
  }, [serverSearch?.value])
  // Filter data (global search)
  const filtered = useMemo(() => {
    if (serverPagination || serverSearch) return data

    if (!search) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      columns.some((col) => String(row[col.accessor]).toLowerCase().includes(q))
    )
  }, [data, search, columns, serverPagination])

  const { notify } = useNotification()
  // Pagination
  const totalPages = serverPagination
    ? serverPagination.lastPage
    : search
      ? data.length
      : Math.ceil(filtered.length / pageSize)

  const paginated = useMemo(() => {
    if (serverPagination) return data
    const start = (page - 1) * pageSize
    return filtered?.slice(start, start + pageSize)
  }, [filtered, page, pageSize, serverPagination, data])

  const handlePageChange = (newPage: number) => {
    if (serverPagination) {
      serverPagination.onPageChange(newPage)
      setPage(newPage)
    } else {
      setPage(newPage)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (serverSearch) {
      serverSearch.onChange(value)
    }
  }

  const canEdit = (row: T) => {
    return disableConfig?.canEdit ? disableConfig.canEdit(row) : true
  }

  const canDelete = (row: T) => {
    return disableConfig?.canDelete ? disableConfig.canDelete(row) : true
  }

  const canView = (row: T) => {
    return disableConfig?.canView ? disableConfig.canView(row) : true
  }

  // Reset page ke 1 bila search berubah
  useEffect(() => {
    if (search) {
      setPage(1)
    }
  }, [search])

  const confirmDelete = () => {
    if (deleteId) {
      router.delete(`${editable}/${deleteId}`)
      setDeleteId(null)
    }
  }

  const badgeComponents = (value: any, badge: 'green' | 'red' | 'yellow' | 'blue' | 'grey') => {
    return <div className={`bg-${badge}-200 text-${badge}-700 px-2 py-1 rounded-md`}>{value}</div>
  }

  return (
    <div className="w-full text-sm text-gray-800 dark:text-gray-200">
      {/* Search */}
      <div className="mb-3 flex justify-end">
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-xs rounded-md border border-gray-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      {/* Tabel wrapper agar responsif */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-purple dark:scrollbar-thumb-dark rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((col, i) =>
                !col.action ? (
                  <th
                    key={i}
                    className={[
                      'px-4 py-3 text-nowrap text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400',
                      col.hideMobile ? 'hidden sm:table-cell' : '',
                      col.className || '',
                    ].join(' ')}
                  >
                    {col.header}
                  </th>
                ) : null
              )}
              {editable && (
                <th className="px-4 py-3 text-nowrap text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  action
                </th>
              )}

              {!editable && viewModal && (
                <th className="px-4 py-3 text-nowrap text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  lihat detail
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
            {paginated.length ? (
              paginated.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map((col, indx) => {
                    if (!col.action) {
                      return (
                        <td
                          key={indx}
                          className={[
                            'whitespace-nowrap px-4 py-3',
                            col.hideMobile ? 'hidden sm:table-cell' : '',
                            col.className || '',
                          ].join(' ')}
                        >
                          {col.isTime
                            ? timeFormat(String(row[col.accessor]), {
                                mode: col.isTime.mode,
                                withDay: col.isTime.withDay,
                              })
                            : col.badge
                              ? badgeComponents(String(row[col.accessor]), col.badge)
                              : String(row[col.accessor])}
                        </td>
                      )
                    }
                  })}
                  {editable && (
                    <td
                      colSpan={columns.length}
                      className="flex gap-2 items-center px-4 py-3 text-center text-gray-500 dark:text-gray-400"
                    >
                      {columns.map((col) => (col.action ? col.action?.(row) : null))}

                      <button
                        onClick={() => canView(row) && onRowClick(row)}
                        disabled={!canView(row)}
                        className={`font-bold hover:underline ${
                          canView(row)
                            ? 'text-green-600 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={!canView(row) ? disableConfig?.disabledMessage : 'View details'}
                      >
                        view
                      </button>

                      <Link
                        href={canEdit(row) ? `${editable}/${row.id || row.nip}/edit` : '#'}
                        className={`font-bold hover:underline ${
                          canEdit(row)
                            ? 'text-yellow-600 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed pointer-events-none'
                        }`}
                        title={!canEdit(row) ? disableConfig?.disabledMessage : 'Edit data'}
                      >
                        edit
                      </Link>

                      <button
                        onClick={() => canDelete(row) && setDeleteId(row.id)}
                        disabled={!canDelete(row)}
                        className={`font-bold hover:underline ${
                          canDelete(row)
                            ? 'text-red-600 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={!canDelete(row) ? disableConfig?.disabledMessage : 'Delete data'}
                      >
                        delete
                      </button>
                    </td>
                  )}

                  {!editable && viewModal && (
                    <td
                      colSpan={columns.length}
                      className="flex gap-2 items-center px-4 py-3 text-center text-gray-500 dark:text-gray-400"
                    >
                      {columns.map((col) => (col.action ? col.action?.(row) : null))}

                      <button
                        onClick={() => canView(row) && onRowClick(row)}
                        disabled={!canView(row)}
                        className={`font-bold hover:underline ${
                          canView(row)
                            ? 'text-green-600 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={!canView(row) ? disableConfig?.disabledMessage : 'View details'}
                      >
                        view
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
                >
                  {noDataText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 text-xs sm:text-sm">
          <div className="text-gray-600 dark:text-gray-400 mb-1 ">
            {serverPagination
              ? `${serverPagination.total} ${tabelName}(s)`
              : `${filtered.length} ${tabelName}(s)`}
          </div>

          <div className="flex items-center gap-1 w-full overflow-auto">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="rounded-md px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Prev
            </button>

            {/* Nomor halaman */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`rounded-md px-3 py-1.5 border ${
                  p === page
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="rounded-md px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Hapus Siswa"
        message="Apakah Anda yakin ingin menghapus data siswa ini? Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
