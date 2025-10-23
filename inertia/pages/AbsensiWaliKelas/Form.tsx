// resources/js/Pages/absensi_wali_kelas/Form.tsx
import React, { useEffect, useState } from 'react'
import { router, useForm, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { offlineStorage } from './offline_storage_service'
import { Notification } from '~/Components/Notification'

interface Props {
  accessibleKelas: any[]
  today: string
  onSubmit: (data: any) => void
  submitLabel: string
}

export default function Form({ accessibleKelas, today, onSubmit, submitLabel }: Props) {
  const { data, setData, processing, errors } = useForm<any>({
    tanggal: today,
    kelasId: '',
    absensi: [],
  })

  const { props } = usePage()
  const pattern = String(props.pattern)
    .split('/')
    .filter((item) => item != '')
  const pathPattern = `/${pattern[0]}/${pattern[1]}/${pattern[2]}`

  const [siswa, setSiswa] = useState<any[]>([])
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [isStorageSupported, setIsStorageSupported] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  // Check if offline storage is supported
  useEffect(() => {
    setIsStorageSupported(offlineStorage.isStorageSupported())
  }, [])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Load siswa when kelas is selected
  useEffect(() => {
    if (data.kelasId) {
      loadSiswaByKelas(data.kelasId)
    } else {
      setSiswa([])
      setData('absensi', [])
    }
  }, [data.kelasId])

  // Check for pending data
  useEffect(() => {
    if (isOnline && isStorageSupported) {
      checkPendingData()
    }
  }, [isOnline, isStorageSupported])

  const loadSiswaByKelas = async (kelasId: string) => {
    try {
      const response = await fetch(`${pathPattern}/siswa/${kelasId}`)
      if (!response.ok) throw new Error('Failed to fetch siswa data')
      const siswaData = await response.json()
      setSiswa(siswaData)
      setData('absensi', siswaData)
    } catch (error) {
      console.error('Gagal memuat data siswa:', error)
      alert('Gagal memuat data siswa. Silakan coba lagi.')
    }
  }

  const checkPendingData = async () => {
    try {
      const pendingData = await offlineStorage.getPendingAbsensi()
      setPendingCount(pendingData?.length || 0)
    } catch (error) {
      console.error('Error checking pending data:', error)
    }
  }

  const handleStatusChange = (userId: string, status: string) => {
    const updatedAbsensi = data.absensi.map((item: any) =>
      item.userId === userId ? { ...item, status } : item
    )
    setData('absensi', updatedAbsensi)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validasi data
    if (!data.kelasId || data.absensi?.length === 0) {
      alert('Harap pilih kelas dan pastikan ada data siswa')
      return
    }

    try {
      if (!isOnline && isStorageSupported) {
        // Save to offline storage
        const pendingData = await offlineStorage.getPendingAbsensi()
        const absensiRecords = data.absensi.map((item: any) => ({
          userId: item.userId,
          kelasId: data.kelasId,
          status: item.status,
          hari: data.tanggal,
        }))

        const newRecords = absensiRecords.filter(
          (newRecord: any) =>
            !pendingData.some(
              (pending) =>
                pending.userId === newRecord.userId &&
                pending.kelasId === newRecord.kelasId &&
                pending.hari === newRecord.hari
            )
        )

        if (newRecords.length === 0) {
          alert('Semua data yang akan disimpan sudah ada dalam antrian offline.')
          return
        }

        if (newRecords.length < absensiRecords.length) {
          const duplicateCount = absensiRecords.length - newRecords.length
          if (
            !confirm(
              `${duplicateCount} data sudah ada dalam antrian offline. Hanya ${newRecords.length} data baru yang akan disimpan. Lanjutkan?`
            )
          ) {
            return
          }
        }

        await offlineStorage.saveAbsensi(absensiRecords)

        // Update pending count
        const newPendingCount = pendingCount + absensiRecords.length
        setPendingCount(newPendingCount)

        alert(
          `Data absensi berhasil disimpan secara offline (${absensiRecords.length} record). Data akan disinkronisasi otomatis saat online.`
        )

        // Reset form setelah simpan offline
        setData('kelasId', '')
        setData('absensi', [])
        setSiswa([])
      } else if (!isOnline && !isStorageSupported) {
        alert(
          'Browser tidak mendukung penyimpanan offline. Silakan gunakan browser lain atau pastikan koneksi internet tersedia.'
        )
      } else {
        // Submit langsung ke server
        router.post(pathPattern, data)
      }
    } catch (error: any) {
      console.error('Gagal menyimpan data absensi:', error)
      alert(`Gagal menyimpan data: ${error.message}`)
    }
  }

  // Sync pending data when online
  useEffect(() => {
    if (isOnline && isStorageSupported && pendingCount > 0) {
      syncPendingData()
    }
  }, [isOnline, isStorageSupported, pendingCount])

  const syncPendingData = async () => {
    try {
      setSyncStatus('syncing')
      const pendingData = await offlineStorage.getPendingAbsensi()
      const payloadData = {
        absensi: pendingData.map((item) => ({
          userId: item.userId,
          kelasId: item.kelasId,
          status: item.status,
          hari: item.hari,
        })),
      }

      if (pendingData.length > 0) {
        router.post(`${pathPattern}/bulk`, payloadData, {
          onSuccess: async () => {
            const ids = pendingData
              .map((item) => item.id)
              .filter((id): id is number => id !== undefined)
            await offlineStorage.markAsSynced(ids)
            setPendingCount(0)
            setSyncStatus('success')
            setTimeout(() => setSyncStatus('idle'), 3000)
            // Clear synced data after successful sync
            setTimeout(() => {
              offlineStorage.clearSyncedData().catch(console.error)
            }, 5000)
          },
        })
      } else {
        setPendingCount(0)
        setSyncStatus('idle')
      }
    } catch (error) {
      console.error('Gagal sinkronisasi data:', error)
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  const statusOptions = [
    { label: 'Hadir', value: 'Hadir' },
    { label: 'Sakit', value: 'Sakit' },
    { label: 'Alfa', value: 'Alfa' },
    { label: 'Izin', value: 'Izin' },
    { label: 'PKL', value: 'PKL' },
  ]

  const kelasOptions = accessibleKelas.map((item: any) => ({
    label: item.namaKelas,
    value: item.id,
  }))

  return (
    <div className="space-y-6">
      <Notification />
      <div
        className={`p-3 rounded-md ${
          isOnline
            ? 'bg-green-100 dark:bg-gray-700 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Status: </span>
            {isOnline ? 'Online' : 'Offline'}
            {!isStorageSupported && ' (Offline storage tidak didukung)'}
            {pendingCount > 0 && (
              <span className="ml-2 text-purple-600">
                - {pendingCount} data menunggu sinkronisasi
              </span>
            )}
          </div>
          {syncStatus === 'syncing' && (
            <span className="text-purple-600 animate-pulse">Menyinkronisasi...</span>
          )}
          {syncStatus === 'success' && (
            <span className="text-green-600">✓ Berhasil disinkronisasi</span>
          )}
          {syncStatus === 'error' && <span className="text-red-600">✗ Gagal sinkronisasi</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Tanggal dan Kelas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <UniversalInput
            type="date"
            name="tanggal"
            label="Tanggal"
            value={data.tanggal}
            onChange={(v: any) => setData('tanggal', v)}
            required
          />

          <UniversalInput
            type="select"
            name="kelasId"
            label="Kelas"
            value={data.kelasId}
            onChange={(v: any) => setData('kelasId', v)}
            options={kelasOptions}
            required
          />
        </div>

        {/* Tabel Siswa */}
        {siswa.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Data Siswa - {siswa.length} siswa
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Pilih status kehadiran untuk setiap siswa
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                      NISN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-100 uppercase tracking-wider">
                      Status Kehadiran
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y ">
                  {siswa.map((siswaItem, index) => (
                    <tr key={siswaItem.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {siswaItem.nisn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {siswaItem.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={data.absensi[index]?.status || 'Hadir'}
                          onChange={(e) =>
                            handleStatusChange(siswaItem.userId, e.target.value as any)
                          }
                          className="block w-full pl-3 pr-10 py-2 text-base dark:bg-gray-900 dark:text-white border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tombol Submit */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={processing || !data.kelasId || data.absensi?.length === 0}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Menyimpan...</span>
              </>
            ) : isOnline ? (
              <span>Simpan ke Database</span>
            ) : (
              <span>Simpan ke Offline Storage</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
