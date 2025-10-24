// resources/js/Pages/Kehadiran/Ujian.tsx
import { router } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { BankSoal } from './types'

export default function Ujian({ bankSoals }: { bankSoals: BankSoal[] }) {
  const startUjian = (ujianId: string) => {
    router.post(
      '/SuperAdmin/manajemen-kehadiran/start-ujian',
      {
        ujianId,
      },
      {
        onSuccess: () => {
          // Bisa redirect ke halaman ujian sebenarnya nanti
          router.visit('/SuperAdmin/manajemen-kehadiran')
        },
      }
    )
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Daftar Ujian Tersedia
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankSoals.map((ujian) => (
          <div
            key={ujian.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {ujian.namaUjian}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Jenjang:</strong> {ujian.jenjang}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Jurusan:</strong> {ujian.jurusan.join(', ')}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Jenis:</strong> {ujian.jenisUjian}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              <strong>Waktu:</strong> {ujian.waktu}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              <strong>Tanggal:</strong> {ujian.tanggalUjian}
            </p>

            <button
              onClick={() => startUjian(ujian.id)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Mulai Ujian
            </button>
          </div>
        ))}
      </div>

      {bankSoals.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">Tidak ada ujian tersedia.</p>
        </div>
      )}
    </div>
  )
}

Ujian.layout = (page: any) => <SuperAdminLayout>{page}</SuperAdminLayout>
