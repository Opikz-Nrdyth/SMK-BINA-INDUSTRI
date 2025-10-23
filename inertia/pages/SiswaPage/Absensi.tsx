// resources/js/Pages/Siswa/Absensi/Index.tsx
import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { Notification } from '~/Components/Notification'

interface MapelGroup {
  id: string
  namaMapel: string
  totalAbsensi: number
  totalHadir: number
  totalTidakHadir: number
  persentaseKehadiran: number
  absensiList: any[]
}

export default function Absensi({
  mapelGroups,
  totalAbsensi,
  totalHadir,
  totalTidakHadir,
}: {
  mapelGroups: MapelGroup[]
  totalAbsensi: number
  totalHadir: number
  totalTidakHadir: number
}) {
  const [search, setSearch] = useState('')

  // Filter mapel berdasarkan search
  const filteredMapelGroups = mapelGroups.filter((mapel) =>
    mapel.namaMapel.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (persentase: number) => {
    if (persentase >= 80) return 'text-green-600'
    if (persentase >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusBgColor = (persentase: number) => {
    if (persentase >= 80) return 'bg-green-100'
    if (persentase >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <SiswaLayout>
      <div className="max-w-7xl mx-auto lg:p-6">
        <Notification />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Riwayat Absensi</h1>
          <p className="text-gray-600">Lihat riwayat kehadiran Anda per mata pelajaran</p>
        </div>

        {/* Statistik Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalAbsensi}</div>
            <div className="text-gray-600 text-sm">Total Pertemuan</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{totalHadir}</div>
            <div className="text-gray-600 text-sm">Hadir</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{totalTidakHadir}</div>
            <div className="text-gray-600 text-sm">Tidak Hadir</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalAbsensi > 0 ? Math.round((totalHadir / totalAbsensi) * 100) : 0}%
            </div>
            <div className="text-gray-600 text-sm">Persentase</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari mata pelajaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-3.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Daftar Mata Pelajaran */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMapelGroups.map((mapel) => (
            <Link
              key={mapel.id}
              href={`/siswa/absensi/mapel/${mapel.id}`}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
            >
              <div className="p-6 flex h-full flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg
                        className="w-6 h-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mapel.namaMapel}</h3>
                      <p className="text-sm text-gray-500">{mapel.totalAbsensi} pertemuan</p>
                    </div>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                <div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hadir:</span>
                      <span className="font-medium text-green-600">{mapel.totalHadir} kali</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tidak Hadir:</span>
                      <span className="font-medium text-red-600">{mapel.totalTidakHadir} kali</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Persentase:</span>
                      <span className={`font-bold ${getStatusColor(mapel.persentaseKehadiran)}`}>
                        {mapel.persentaseKehadiran}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Kehadiran</span>
                      <span className="font-medium">{mapel.persentaseKehadiran}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getStatusBgColor(mapel.persentaseKehadiran)}`}
                        style={{ width: `${mapel.persentaseKehadiran}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                      Klik untuk melihat detail absensi
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredMapelGroups.length === 0 && (
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {search ? 'Mata pelajaran tidak ditemukan' : 'Belum Ada Data Absensi'}
            </h3>
            <p className="text-gray-500">
              {search
                ? 'Coba gunakan kata kunci lain'
                : 'Data absensi akan muncul setelah Anda memiliki riwayat kehadiran'}
            </p>
          </div>
        )}
      </div>
    </SiswaLayout>
  )
}
