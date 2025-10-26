// resources/js/Pages/absensi_wali_kelas/Index.tsx
import React, { useEffect, useState, useCallback } from 'react'
import { usePage, router, Link } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import ModalView from '~/Components/ModalView'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { offlineStorage } from './offline_storage_service'
import GuruLayout from '~/Layouts/GuruLayouts'

interface IndexProps {
  auth: any
  absensi: any[]
  accessibleKelas: any[]
  filter: any
  absensiPaginate: any
  searchQuery?: string
}

export default function Index({
  auth,
  absensi,
  accessibleKelas,
  filter,
  absensiPaginate,
  searchQuery = '',
}: IndexProps) {
  const { props } = usePage()

  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [currentPage, setCurrentPage] = useState(absensiPaginate?.currentPage || 1)
  const [lastPage, setLastPage] = useState(absensiPaginate?.lastPage || 1)
  const [search, setSearch] = useState(searchQuery)
  const [currentFilter, setCurrentFilter] = useState({
    kelasId: filter?.kelasId || '',
    tanggal: filter?.tanggal || new Date().toISOString().split('T')[0],
  })
  const [pendingCount, setPendingCount] = useState(0)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [filterTimeout, setFilterTimeout] = useState<NodeJS.Timeout | null>(null)

  // Process data hanya ketika absensi berubah
  useEffect(() => {
    if (!absensi) return

    const newData = [] as any
    absensi?.forEach((item: any) => {
      newData.push({
        id: item.id,
        siswa: item.userName,
        kelas: item.kelasName,
        status: item.status,
        hari: item.hari ? new Date(item.hari).toLocaleDateString('id-ID') : '-',
        createdAt: item.createdAt,
        userId: item.userId,
        kelasId: item.kelasId,
        syncStatus: 'synced',
      })
    })
    setData(newData)
  }, [absensi])

  // Monitor online status dan pending data
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    checkPendingData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      if (filterTimeout) {
        clearTimeout(filterTimeout)
      }
    }
  }, [])

  const checkPendingData = async () => {
    if (offlineStorage.isStorageSupported()) {
      try {
        const pendingData = await offlineStorage.getPendingAbsensi()
        setPendingCount(pendingData.length)
      } catch (error) {
        console.error('Error checking pending data:', error)
      }
    }
  }

  const handlePageChange = (page: number) => {
    router.get(
      String(props.pattern),
      { page, ...currentFilter, search },
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
      { page: 1, ...currentFilter, search: searchTerm },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
    setCurrentPage(1)
  }

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      const newFilter = { ...currentFilter, [key]: value }
      setCurrentFilter(newFilter)

      if (filterTimeout) {
        clearTimeout(filterTimeout)
      }

      const timeout = setTimeout(() => {
        router.get(
          String(props.pattern),
          { ...newFilter, search },
          {
            preserveState: true,
            replace: true,
            only: ['absensi', 'accessibleKelas', 'filter', 'absensiPaginate'],
          }
        )
      }, 500)

      setFilterTimeout(timeout)
    },
    [currentFilter, filterTimeout, search]
  )

  const handleSyncNow = async () => {
    if (!isOnline) {
      alert('Tidak dapat sinkronisasi saat offline')
      return
    }

    try {
      const pendingData = await offlineStorage.getPendingAbsensi()
      if (pendingData.length === 0) {
        alert('Tidak ada data yang menunggu sinkronisasi')
        return
      }

      const payloadData = {
        absensi: pendingData.map((item: any) => ({
          userId: item.userId,
          kelasId: item.kelasId,
          status: item.status,
          hari: item.hari,
        })),
      }

      router.post(`${String(props.pattern)}/absensi/bulk`, payloadData, {
        onSuccess: async () => {
          const ids = pendingData
            .map((item: any) => item.id)
            .filter((id: any): id is number => id !== undefined)
          await offlineStorage.markAsSynced(ids)
          setPendingCount(0)
          alert(`Berhasil menyinkronisasi ${pendingData.length} data absensi`)
          router.reload()
        },
        onError: (errors) => {
          console.error('Sync error:', errors)
          alert('Gagal menyinkronisasi data. Silakan coba lagi.')
        },
      })
    } catch (error) {
      console.error('Gagal sinkronisasi:', error)
      alert('Gagal menyinkronisasi data. Silakan coba lagi.')
    }
  }

  const kelasOptions = accessibleKelas.map((item: any) => ({
    label: item.namaKelas,
    value: item.id,
  }))

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hadir':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'izin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'sakit':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'alfa':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header dengan Status Info */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Data Absensi Wali Kelas
          </h1>
          <div className={`mt-2 text-sm ${isOnline ? 'text-green-600' : 'text-pink-500'}`}>
            Status: {isOnline ? 'Online' : 'Offline'}
            {pendingCount > 0 && (
              <span className="ml-2 text-purple-600 font-medium">
                • {pendingCount} data menunggu sinkronisasi
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-3">
          {pendingCount > 0 && isOnline && (
            <button
              onClick={handleSyncNow}
              className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 flex items-center space-x-2 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Sync Now ({pendingCount})</span>
            </button>
          )}
          <Link
            href={`${String(props.pattern)}/create`}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200"
          >
            Tambah Absensi
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border border-purple-200 dark:border-purple-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Tanggal
            </label>
            <input
              type="date"
              value={currentFilter.tanggal}
              onChange={(e) => handleFilterChange('tanggal', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border dark:text-gray-50 border-purple-300 dark:bg-gray-700 dark:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md transition-colors duration-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
              Kelas
            </label>
            <select
              value={currentFilter.kelasId}
              onChange={(e) => handleFilterChange('kelasId', e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border dark:text-gray-50 border-purple-300 dark:bg-gray-700 dark:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md transition-colors duration-200"
            >
              <option value="">Semua Kelas</option>
              {kelasOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button
              onClick={() => {
                const resetFilter = { kelasId: '', tanggal: new Date().toISOString().split('T')[0] }
                setCurrentFilter(resetFilter)
                setSearch('')
                router.get(String(props.pattern), resetFilter, {
                  preserveState: true,
                  replace: true,
                })
              }}
              className="px-4 py-2 text-nowrap bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200"
            >
              Reset Filter
            </button>
            <button
              onClick={checkPendingData}
              className="px-4 py-2 text-nowrap bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors duration-200"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      <DataTable
        data={data}
        tabelName="Absensi Wali Kelas"
        columns={[
          { header: 'Siswa', accessor: 'siswa' as const },
          { header: 'Kelas', accessor: 'kelas' as const },
          {
            header: 'Status',
            accessor: 'status' as const,
            render: (value: string) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(value)}`}
              >
                {value}
              </span>
            ),
          },
          {
            header: 'Hari',
            accessor: 'hari' as const,
            isTime: { mode: 'date', withDay: true },
          },
        ]}
        pageSize={15}
        placeholder="Cari absensi berdasarkan siswa, kelas, atau status..."
        noDataText="Tidak ada data absensi"
        onRowClick={(value: any) => setDataSelected(value)}
        serverPagination={{
          currentPage,
          lastPage,
          total: absensiPaginate?.total || 0,
          onPageChange: handlePageChange,
        }}
        serverSearch={{
          value: search,
          onChange: handleSearch,
        }}
        editable={`${String(props.pattern)}`}
      />

      <ModalView
        data={dataSelected}
        exclude={['user', 'kelas', 'userName', 'kelasName', 'userId', 'kelasId', 'syncStatus']}
        open={!!dataSelected}
        onClose={() => setDataSelected(null)}
        title="Detail Absensi Wali Kelas"
      />
    </div>
  )
}

Index.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
