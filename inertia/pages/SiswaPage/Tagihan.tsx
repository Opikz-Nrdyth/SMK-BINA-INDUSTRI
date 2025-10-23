// resources/js/Pages/Siswa/Tagihan/Index.tsx
import { useState } from 'react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { Notification } from '~/Components/Notification'

interface TagihanItem {
  id: string
  jenisPembayaran: string
  nominalPenetapan: number
  totalDibayar: number
  sisaPembayaran: number
  lunas: boolean
  riwayatPembayaran: any[]
  pembayaranTerakhir: any | null
  createdAt: string
  updatedAt: string
}

export default function Index({
  tagihan,
  statistik,
  user,
}: {
  tagihan: TagihanItem[]
  statistik: {
    totalTagihan: number
    tagihanLunas: number
    tagihanBelumLunas: number
    totalHutang: number
  }
  user: any
}) {
  const [filter, setFilter] = useState<'semua' | 'lunas' | 'belum-lunas'>('belum-lunas')

  // Format currency
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format tanggal
  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Filter tagihan berdasarkan status
  const filteredTagihan = tagihan.filter((item) => {
    if (filter === 'lunas') return item.lunas
    if (filter === 'belum-lunas') return !item.lunas
    return true
  })

  // Progress bar untuk pembayaran
  const ProgressBar = ({ item }: { item: TagihanItem }) => {
    const progress =
      item.nominalPenetapan > 0 ? (item.totalDibayar / item.nominalPenetapan) * 100 : 0

    return (
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Progress Pembayaran</span>
          <span className="font-medium">
            {Math.round(progress) > 100 ? 100 : Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${item.lunas ? 'bg-green-500' : 'bg-blue-500'}`}
            style={{ width: `${progress > 100 ? 100 : progress}%` }}
          ></div>
        </div>
      </div>
    )
  }

  return (
    <SiswaLayout>
      <div className="max-w-7xl mx-auto lg:p-6">
        <Notification />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tagihan Saya</h1>
          <p className="text-gray-600">Lihat status pembayaran dan tagihan Anda</p>
        </div>

        {/* Statistik Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistik.totalTagihan}</div>
            <div className="text-gray-600 text-sm">Total Tagihan</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{statistik.tagihanLunas}</div>
            <div className="text-gray-600 text-sm">Lunas</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{statistik.tagihanBelumLunas}</div>
            <div className="text-gray-600 text-sm">Belum Lunas</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-red-600">
              {formatRupiah(statistik.totalHutang)}
            </div>
            <div className="text-gray-600 text-sm">Tagihan Belum Lunas</div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFilter('semua')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'semua'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua ({tagihan.length})
          </button>
          <button
            onClick={() => setFilter('lunas')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'lunas'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lunas ({statistik.tagihanLunas})
          </button>
          <button
            onClick={() => setFilter('belum-lunas')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'belum-lunas'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Belum Lunas ({statistik.tagihanBelumLunas})
          </button>
        </div>

        {/* Daftar Tagihan */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTagihan.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 p-6 hover:shadow-md transition-all ${
                item.lunas
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Header Card */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.lunas ? 'bg-green-100' : 'bg-blue-100'}`}>
                    <svg
                      className={`w-6 h-6 ${item.lunas ? 'text-green-600' : 'text-blue-600'}`}
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
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{item.jenisPembayaran}</h3>
                    <div
                      className={`text-sm font-medium ${
                        item.lunas ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {item.lunas ? 'LUNAS' : 'BELUM LUNAS'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informasi Pembayaran */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tagihan:</span>
                  <span className="font-bold text-gray-900">
                    {formatRupiah(item.nominalPenetapan)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sudah Dibayar:</span>
                  <span className="font-medium text-green-600">
                    {formatRupiah(item.totalDibayar)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sisa:</span>
                  <span className={`font-bold ${item.lunas ? 'text-green-600' : 'text-red-600'}`}>
                    {formatRupiah(item.sisaPembayaran)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar item={item} />

              {/* Pembayaran Terakhir */}
              {item.pembayaranTerakhir && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Pembayaran Terakhir:</div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-medium">
                      {formatRupiah(parseFloat(item.pembayaranTerakhir.nominal))}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTanggal(item.pembayaranTerakhir.tanggal)}
                    </span>
                  </div>
                </div>
              )}

              {/* Riwayat Pembayaran */}
              {item.riwayatPembayaran.length > 0 && (
                <div className="mt-4">
                  <details className="group">
                    <summary className="flex justify-between items-center cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                      <span>Lihat Riwayat ({item.riwayatPembayaran.length})</span>
                      <svg
                        className="w-4 h-4 group-open:rotate-180 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </summary>
                    <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                      {item.riwayatPembayaran.map((bayar, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded"
                        >
                          <span className="text-gray-700">{formatTanggal(bayar.tanggal)}</span>
                          <span className="font-medium text-green-600">
                            {formatRupiah(parseFloat(bayar.nominal))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Created Date */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">Dibuat: {formatTanggal(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredTagihan.length === 0 && (
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
              {filter === 'semua'
                ? 'Belum Ada Tagihan'
                : `Tidak Ada Tagihan ${filter === 'lunas' ? 'Lunas' : 'Belum Lunas'}`}
            </h3>
            <p className="text-gray-500">
              {filter === 'semua'
                ? 'Anda belum memiliki tagihan pembayaran'
                : `Tidak ada tagihan dengan status ${filter === 'lunas' ? 'lunas' : 'belum lunas'}`}
            </p>
          </div>
        )}
      </div>
    </SiswaLayout>
  )
}
