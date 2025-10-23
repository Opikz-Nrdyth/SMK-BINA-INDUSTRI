// resources/js/Pages/Siswa/Absensi/DetailMapel.tsx
import { Link } from '@inertiajs/react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { Notification } from '~/Components/Notification'

export default function DetailMapel({
  absensi,
  mapel,
  statistik,
}: {
  absensi: any[]
  mapel: any
  statistik: {
    totalPertemuan: number
    totalHadir: number
    totalTidakHadir: number
    persentaseKehadiran: number
  }
}) {
  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; bgColor: string } } = {
      Hadir: { color: 'text-green-800', bgColor: 'bg-green-100' },
      Izin: { color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
      Sakit: { color: 'text-blue-800', bgColor: 'bg-blue-100' },
      Alpha: { color: 'text-red-800', bgColor: 'bg-red-100' },
    }

    const config = statusConfig[status] || { color: 'text-gray-800', bgColor: 'bg-gray-100' }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${config.color} ${config.bgColor}`}
      >
        {status}
      </span>
    )
  }

  return (
    <SiswaLayout>
      <div className="max-w-7xl mx-auto lg:p-6">
        <Notification />

        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                href="/siswa/absensi"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Absensi
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {mapel.namaMataPelajaran}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{mapel.namaMataPelajaran}</h1>
              <p className="text-gray-600">Detail riwayat kehadiran mata pelajaran</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                {statistik.persentaseKehadiran}%
              </div>
              <div className="text-blue-600 font-medium">Persentase Kehadiran</div>
            </div>
          </div>

          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{statistik.totalPertemuan}</div>
              <div className="text-sm text-gray-600">Total Pertemuan</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{statistik.totalHadir}</div>
              <div className="text-sm text-gray-600">Hadir</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{statistik.totalTidakHadir}</div>
              <div className="text-sm text-gray-600">Tidak Hadir</div>
            </div>
          </div>
        </div>

        {/* Daftar Absensi */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Riwayat Kehadiran</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {absensi.map((item, index) => (
              <div key={index} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.tanggal}</div>
                      <div className="text-sm text-gray-500">
                        {item.hari} • {item.kelasName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(item.status)}
                    <div className="text-sm text-gray-500">{item.bulan}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {absensi.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Data Absensi</h3>
              <p className="text-gray-500">Belum ada riwayat kehadiran untuk mata pelajaran ini</p>
            </div>
          )}
        </div>
      </div>
    </SiswaLayout>
  )
}
