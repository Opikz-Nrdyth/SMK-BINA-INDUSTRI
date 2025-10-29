// resources/js/Pages/BankSoal/EditSoal.tsx
import React, { useState, useEffect } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { BankSoal, SoalItem } from './types'
import { offlineStorage } from './offline_soal_service'
import { useNotification } from '~/Components/NotificationAlert'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import UniversalInput from '~/Components/UniversalInput'

interface EditSoalProps {
  bankSoal: BankSoal
  soalContent: SoalItem[]
}

export default function EditSoal({ bankSoal, soalContent }: EditSoalProps) {
  const [soals, setSoals] = useState<SoalItem[]>(
    soalContent?.map((soal) => ({
      ...soal,
      syncStatus: 'synced' as const,
    })) || []
  )
  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const { notify } = useNotification()

  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isStorageSupported, setIsStorageSupported] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Input khusus di atas (untuk edit soal)
  const [editingSoal, setEditingSoal] = useState<SoalItem | null>(null)
  const [quickSoal, setQuickSoal] = useState({
    id: '',
    soal: '',
    A: '',
    B: '',
    C: '',
    D: '',
    E: '',
    kunci: 'A' as const,
  })

  useEffect(() => {
    setIsStorageSupported(offlineStorage.isStorageSupported())
  }, [])

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
  useEffect(() => {
    const soals = soalContent.map((item) => ({
      ...item,
      syncStatus: 'synced' as const,
    }))

    const getPendingData = async () => {
      const storagePending = await offlineStorage.getPendingSoal()
      const uniquePending = storagePending.filter(
        (pending) =>
          !soals.some(
            (s) =>
              s.soal === pending.soal &&
              s.A === pending.A &&
              s.B === pending.B &&
              s.C === pending.C &&
              s.D === pending.D &&
              s.E === pending.E &&
              s.kunci === pending.kunci
          )
      )

      const pendingSoal = [...soals, ...uniquePending]
      setSoals(pendingSoal)
    }

    getPendingData()
  }, [soalContent])

  useEffect(() => {
    if (isOnline && isStorageSupported) {
      checkPendingData()
    }
  }, [isOnline, isStorageSupported])

  const checkPendingData = async () => {
    try {
      const pendingData = await offlineStorage.getPendingSoal()
      setPendingCount(pendingData?.length)
    } catch (error) {
      console.error('Error checking pending data:', error)
    }
  }

  // Fungsi untuk edit soal
  const startEditSoal = (soal: SoalItem, index: number) => {
    setEditingSoal({ ...soal, tempId: `edit-${index}` })
    setQuickSoal({
      id: soal.id,
      soal: soal.soal,
      A: soal.A,
      B: soal.B,
      C: soal.C,
      D: soal.D,
      E: soal.E,
      kunci: soal.kunci,
    })
  }

  const cancelEdit = () => {
    setEditingSoal(null)
    setQuickSoal({
      id: '',
      soal: '',
      A: '',
      B: '',
      C: '',
      D: '',
      E: '',
      kunci: 'A',
    })
  }

  const saveToServer = async (soalContent: SoalItem[]) => {
    try {
      const contentToSave = soalContent.map((soal) => ({
        id: soal.id || Math.floor(Math.random() * 1001),
        soal: soal.soal,
        A: soal.A,
        B: soal.B,
        C: soal.C,
        D: soal.D,
        E: soal.E,
        kunci: soal.kunci,
      }))

      if (isOnline) {
        await router.put(
          `${url}/${bankSoal.id}/update-soal`,
          {
            soalContent: contentToSave,
          },
          {
            preserveScroll: true,
          }
        )
      }

      if (!isOnline && isStorageSupported) {
        const pendingData = await offlineStorage.getPendingSoal()

        const soalRecords: SoalItem[] = contentToSave.map((item: SoalItem) => ({
          id: item.id || Math.floor(Math.random() * 1001),
          soal: item.soal,
          A: item.A,
          B: item.B,
          C: item.C,
          D: item.D,
          E: item.E,
          kunci: item.kunci,
        }))

        const newRecords = soalRecords.filter(
          (newRecord) =>
            !pendingData.some(
              (pending) =>
                pending.A === newRecord.A &&
                pending.B === newRecord.B &&
                pending.C === newRecord.C &&
                pending.D === newRecord.D &&
                pending.E === newRecord.E &&
                pending.kunci === newRecord.kunci
            )
        )

        if (newRecords.length === 0) {
          notify('Semua data yang akan disimpan sudah ada dalam antrian offline.')

          return
        }

        await offlineStorage.clearSyncedData('all')

        await offlineStorage.saveSoal(soalRecords)
        const newPendingCount = pendingCount + soalRecords?.length
        setPendingCount(newPendingCount)

        notify(
          `Data absensi berhasil disimpan secara offline (${soalRecords?.length} record). Data akan disinkronisasi otomatis saat online.`
        )
      }
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    if (isOnline && isStorageSupported && pendingCount > 0) {
      syncPendingData()
    }
  }, [isOnline, isStorageSupported, pendingCount])

  const syncPendingData = async () => {
    try {
      setSyncStatus('syncing')
      const pendingData = await offlineStorage.getPendingSoal()

      if (pendingData?.length > 0) {
        await saveToServer(pendingData)
        const ids = pendingData
          .map((item) => item.id)
          .filter((id): id is number => id !== undefined)
        await offlineStorage.markAsSynced(ids)

        setPendingCount(0)
        setSyncStatus('success')
        setTimeout(() => setSyncStatus('idle'), 3000)
        setTimeout(() => {
          offlineStorage.clearSyncedData('synced').catch(console.error)
        }, 5000)
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

  const handleTambahSoal = async () => {
    if (
      !quickSoal.soal ||
      !quickSoal.A ||
      !quickSoal.B ||
      !quickSoal.C ||
      !quickSoal.D ||
      !quickSoal.E
    ) {
      notify('Harap lengkapi semua field soal dan opsi jawaban')
      return
    }

    const newSoal: SoalItem = {
      ...quickSoal,
      id: quickSoal.id ?? Math.floor(Math.random() * 1001),
      tempId: `new-${Date.now()}`,
      syncStatus: 'unsaved' as const,
    }

    const updatedSoals = [...(soals || []), newSoal]

    try {
      setIsSubmitting(true)

      // Simpan langsung ke server
      await saveToServer(updatedSoals)
      notify('Soal berhasil ditambahkan dan disimpan ke server.')

      // Reset form
      setQuickSoal({
        id: '',
        soal: '',
        A: '',
        B: '',
        C: '',
        D: '',
        E: '',
        kunci: 'A',
      })
    } catch (error) {
      console.error('Gagal menambah soal:', error)
      notify('Gagal menambah soal. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSoal = async () => {
    if (!editingSoal) return

    if (
      !quickSoal.soal ||
      !quickSoal.A ||
      !quickSoal.B ||
      !quickSoal.C ||
      !quickSoal.D ||
      !quickSoal.E
    ) {
      notify('Harap lengkapi semua field soal dan opsi jawaban')
      return
    }

    // Cari index soal yang sedang diedit
    const index = soals?.findIndex(
      (s) => s.tempId === editingSoal.tempId || s.id === editingSoal.id
    )

    if (index !== -1) {
      const updatedSoals = [...(soals || [])]
      updatedSoals[index] = {
        ...updatedSoals[index],
        ...quickSoal,
        syncStatus: 'unsaved' as const,
      }

      try {
        setIsSubmitting(true)

        // Simpan langsung ke server
        await saveToServer(updatedSoals)
        notify('Soal berhasil diubah dan disimpan ke server.')

        cancelEdit()
      } catch (error) {
        console.error('Gagal mengedit soal:', error)
        notify('Gagal mengedit soal. Silakan coba lagi.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const removeSoal = async (index: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus soal ini?')) return

    const soalToRemove = soals?.[index]
    if (!soalToRemove?.id) {
      notify('ID soal tidak ditemukan untuk index:' + String(index))
      return
    }

    const updatedSoals = soals?.filter((_, i) => i !== index) || []

    try {
      setIsSubmitting(true)

      await offlineStorage.clearById(soalToRemove?.id)
      await saveToServer(updatedSoals)
      notify('Soal berhasil dihapus dari server.')
    } catch (error) {
      console.error('Gagal menghapus soal:', error)
      notify('Gagal menghapus soal. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const moveSoal = async (index: number, direction: 'up' | 'down') => {
    const updatedSoals = [...(soals || [])]

    if (direction === 'up' && index > 0) {
      ;[updatedSoals[index], updatedSoals[index - 1]] = [
        updatedSoals[index - 1],
        updatedSoals[index],
      ]
    } else if (direction === 'down' && index < updatedSoals.length - 1) {
      ;[updatedSoals[index], updatedSoals[index + 1]] = [
        updatedSoals[index + 1],
        updatedSoals[index],
      ]
    } else {
      return
    }

    try {
      setIsSubmitting(true)

      // Simpan langsung ke server
      await saveToServer(updatedSoals)
    } catch (error) {
      console.error('Gagal memindahkan soal:', error)
      notify('Gagal memindahkan soal. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log(quickSoal);
  

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />

      {/* Header dengan Status */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Soal: {bankSoal.namaUjian}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {bankSoal.jenisUjian} | Kelas {bankSoal.jenjang}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Online/Offline */}
          {syncStatus === 'syncing' && (
            <span className="text-purple-600 animate-pulse">Menyinkronisasi...</span>
          )}
          {syncStatus === 'success' && (
            <span className="text-green-600">✓ Berhasil disinkronisasi</span>
          )}
          {syncStatus === 'error' && <span className="text-red-600">✗ Gagal sinkronisasi</span>}
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOnline ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </div>

          <Link
            href={url}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Kembali
          </Link>
          {props.user.role != 'Guru' ? (
            <Link
              href={`${url}/${bankSoal.id}/selected-soal`}
              className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
            >
              Select Soal
            </Link>
          ) : null}
        </div>
      </div>

      {/* Input Cepat di Atas (Fixed) - Untuk Edit dan Tambah Soal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 top-4 z-10 border-2 border-purple-200">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingSoal ? '✏️ Edit Soal' : '➕ Tambah Soal Baru'}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {/* Input Soal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pertanyaan
            </label>
            <UniversalInput
              name="soal"
              type="richtext"
              value={quickSoal.soal}
              onChange={(e) => setQuickSoal((prev) => ({ ...prev, soal: e }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              placeholder="Tulis soal disini..."
            />
          </div>

          {/* Opsi Jawaban */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['A', 'B', 'C', 'D', 'E'].map((opsi) => (
              <div key={opsi}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opsi {opsi}
                </label>
                <UniversalInput
                  name="soal"
                  type="richtext"
                  value={quickSoal[opsi as keyof typeof quickSoal] as string}
                  onChange={(e) => setQuickSoal((prev) => ({ ...prev, [opsi]: e }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder={`Jawaban ${opsi}...`}
                />
              </div>
            ))}
          </div>

          {/* Kunci Jawaban dan Tombol */}
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Kunci Jawaban
              </label>
              <select
                onChange={(e) => setQuickSoal((prev) => ({ ...prev, kunci: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                {['A', 'B', 'C', 'D', 'E'].map((opsi) => (
                  <option key={opsi} selected={opsi == quickSoal.kunci} value={opsi}>
                    Opsi {opsi}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              {editingSoal && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Batal Edit
                </button>
              )}
              <button
                type="button"
                onClick={editingSoal ? handleEditSoal : handleTambahSoal}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Menyimpan...</span>
                  </>
                ) : editingSoal ? (
                  <span>Simpan Perubahan</span>
                ) : (
                  <span>Tambah Soal</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Soal (Hanya Teks) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Daftar Soal ({soals?.length || 0} soal)
          </h2>
        </div>

        {soals?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Belum ada soal. Gunakan form di atas untuk menambahkan soal pertama.
          </div>
        ) : (
          <div className="space-y-3">
            {soals?.map((soal, index) => (
              <SoalListItem
                key={soal.tempId || soal.id || index}
                soal={soal}
                index={index}
                onEdit={() => startEditSoal(soal, index)}
                onRemove={() => removeSoal(index)}
                onMove={moveSoal}
                canMoveUp={index > 0}
                canMoveDown={index < (soals?.length || 0) - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Komponen List Item untuk setiap soal (hanya teks)
interface SoalListItemProps {
  soal: SoalItem
  index: number
  onEdit: () => void
  onRemove: () => void
  onMove: (index: number, direction: 'up' | 'down') => void
  canMoveUp: boolean
  canMoveDown: boolean
}

function SoalListItem({
  soal,
  index,
  onEdit,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
}: SoalListItemProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'synced':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'unsaved':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'synced':
        return 'Tersimpan'
      case 'pending':
        return 'Belum Tersimpan'
      default:
        return status
    }
  }

  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <div className="flex items-center flex-1">
        <div className="flex items-center">
          <button
            type="button"
            title="Pindah Keatas"
            onClick={() => onMove(index, 'up')}
            disabled={!canMoveUp}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            type="button"
            title="Pindah Kebawah"
            onClick={() => onMove(index, 'down')}
            disabled={!canMoveDown}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
          >
            ↓
          </button>
        </div>

        <div className="flex">
          <div className="flex-shrink-0 w-8 text-center font-medium text-gray-500">
            {index + 1}.
          </div>
          <div>
            <div
              className="text-gray-900 dark:text-white line-clamp-2"
              dangerouslySetInnerHTML={{ __html: soal.soal }}
            ></div>
            <div className="text-gray-900 dark:text-white flex flex-wrap gap-3">
              <span className="flex flex-wrap">
                A. <span dangerouslySetInnerHTML={{ __html: soal.A }}></span>
              </span>
              <span className="flex flex-wrap">
                B. <span dangerouslySetInnerHTML={{ __html: soal.B }}></span>
              </span>
              <span className="flex flex-wrap">
                C. <span dangerouslySetInnerHTML={{ __html: soal.C }}></span>
              </span>
              <span className="flex flex-wrap">
                D. <span dangerouslySetInnerHTML={{ __html: soal.D }}></span>
              </span>
              <span className="flex flex-wrap">
                E. <span dangerouslySetInnerHTML={{ __html: soal.E }}></span>
              </span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Kunci: <span className="font-medium">{soal.kunci}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(soal.syncStatus)}`}
        >
          {getStatusText(soal.syncStatus)}
        </span>

        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1 bg-purple-500 text-white rounded-md hover:bg-purple-600 text-sm"
        >
          Edit
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
        >
          Hapus
        </button>
      </div>
    </div>
  )
}

EditSoal.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
