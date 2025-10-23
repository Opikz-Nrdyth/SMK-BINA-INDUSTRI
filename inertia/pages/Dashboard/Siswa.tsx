// resources/js/Pages/Siswa/Dashboard/Index.tsx
import { Link, router } from '@inertiajs/react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { Notification } from '~/Components/Notification'
import { DateTime } from 'luxon'
import { timeFormat } from '~/Components/FormatWaktu'

interface UjianAkanDatang {
  id: string
  namaUjian: string
  jenisUjian: string
  tanggalUjian: string
  waktu: string
}

interface ChartData {
  date: string
  label: string
  status: string
  hadir: boolean
  warna: string
  nextMonth: string
  prevMonth: string
  calendarData: any[]
  month: string
}

export default function Index({
  statistik,
  chartAbsensi,
  ujianAkanDatang,
  user,
}: {
  statistik: {
    absensi: {
      total: number
      hadir: number
      izin: number
      sakit: number
      alpha: number
      persentase: number
    }
    ujian: {
      total: number
      selesai: number
      dalamPengerjaan: number
    }
  }
  chartAbsensi: ChartData[]
  ujianAkanDatang: UjianAkanDatang[]
  user: any
}) {
  // Format tanggal
  const formatTanggal = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Menu akses cepat
  const quickAccess = [
    {
      title: 'Ujian',
      description: 'Ikuti ujian yang tersedia',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: '/siswa/jadwalujian',
      color: 'bg-blue-500',
    },
    {
      title: 'Absensi',
      description: 'Lihat riwayat kehadiran',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: '/siswa/absensi',
      color: 'bg-green-500',
    },
    {
      title: 'Hasil Ujian',
      description: 'Lihat nilai dan jawaban',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      href: '/siswa/riwayatujian',
      color: 'bg-purple-500',
    },
  ]

  const legendItems = [
    { color: 'bg-green-500', label: 'Hadir' },
    { color: 'bg-yellow-500', label: 'Izin' },
    { color: 'bg-blue-500', label: 'Sakit' },
    { color: 'bg-red-500', label: 'Alpha' },
    { color: 'bg-gray-300', label: 'Tidak Ada Data' },
  ]

  return (
    <SiswaLayout title="Dashboard Siswa">
      <div className="max-w-7xl mx-auto lg:p-6">
        <Notification />

        {/* Header Welcome */}
        <div className="bg-purple-600 relative h-52 rounded-md md:px-3 py-4">
          <p className="text-sm text-purple-300 ml-3">
            {timeFormat(new Date().toISOString(), { mode: 'date', withDay: true })}
          </p>
          <div className="ml-4 lg:mt-16">
            <h1 className="text-2xl mt-5 lg:mt-0 md:text-4xl font-bold text-gray-100 relative">
              Selamat Datang bos, {user.fullName.split(' ')[0]}!
            </h1>
            <p className="text-purple-300 text-sm md:text-xl relative z-10">
              Selamat belajar dan raih prestasi terbaikmu!
            </p>
          </div>
          <img
            src="/images/bg-siswa.png"
            alt="hero-graduate"
            className="w-[450px] absolute right-0 bottom-0 opacity-25"
          />
        </div>

        {/* Statistik Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
          {/* Statistik Absensi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statistik Absensi</h3>
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statistik.absensi.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistik.absensi.hadir}</div>
                <div className="text-sm text-gray-600">Hadir</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{statistik.absensi.izin}</div>
                <div className="text-sm text-gray-600">Izin</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{statistik.absensi.sakit}</div>
                <div className="text-sm text-gray-600">Sakit</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{statistik.absensi.alpha}</div>
                <div className="text-sm text-gray-600">Alpha</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {statistik.absensi.persentase}%
                </div>
                <div className="text-sm text-gray-600">Kehadiran</div>
              </div>
            </div>
          </div>

          {/* Statistik Ujian */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Statistik Ujian</h3>
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{statistik.ujian.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{statistik.ujian.selesai}</div>
                <div className="text-sm text-gray-600">Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {statistik.ujian.dalamPengerjaan}
                </div>
                <div className="text-sm text-gray-600">Dalam Pengerjaan</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 px-3 lg:grid-cols-1 gap-8">
          {/* Quick Access & Chart */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Akses Cepat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {quickAccess.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl text-white ${item.color}`}>{item.icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Header dengan Navigation */}
              <div className="flex flex-col items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      router.visit(`/siswa/${chartAbsensi.prevMonth}`, {
                        preserveScroll: true,
                      })
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <h3 className="text-lg font-semibold text-gray-900">{chartAbsensi.month}</h3>

                  <button
                    onClick={() => {
                      router.visit(`/siswa/${chartAbsensi.nextMonth}`, {
                        preserveScroll: true,
                      })
                    }}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600"
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
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center space-x-4 text-sm">
                  {legendItems.map((item, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded ${item.color}`}></div>
                      <span className="text-gray-600">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Headers - Minggu berwarna merah */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, index) => (
                  <div
                    key={day}
                    className={`text-center text-sm font-medium py-2 ${
                      index === 0 ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {chartAbsensi.calendarData.map((day, index) => (
                  <div
                    key={index}
                    className={`
          aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-1
          ${day.isCurrentMonth ? 'border-gray-200' : 'border-gray-100'}
          ${!day.isCurrentMonth ? 'bg-gray-50' : ''}
          ${day.isSunday ? 'bg-red-50 border-red-200' : ''}
          hover:shadow-md transition-all cursor-help
        `}
                    title={`${DateTime.fromISO(day.date).toFormat('dd/MM/yyyy')}: ${day.status}`}
                  >
                    {/* Tanggal - Minggu berwarna merah */}
                    <div
                      className={`text-xs md:text-xl font-medium mb-1 ${
                        day.isSunday
                          ? 'text-red-600'
                          : day.isCurrentMonth
                            ? 'text-gray-900'
                            : 'text-gray-400'
                      }`}
                    >
                      {day.day}
                    </div>

                    {/* Status Indicator */}
                    <div className={`w-3 h-3 rounded-full ${day.warna}`}></div>
                  </div>
                ))}
              </div>

              {/* Footer Summary */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  {chartAbsensi.daysHadir} hari hadir dari {chartAbsensi.totalDays} hari di{' '}
                  {chartAbsensi.month}
                </p>
              </div>
            </div>
          </div>

          {/* Ujian Akan Datang */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Ujian Akan Datang</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {ujianAkanDatang.length > 0 ? (
                <div className="space-y-4">
                  {ujianAkanDatang.slice(0, 3).map((ujian, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-gray-900 text-sm mb-1">
                        {ujian.namaUjian}
                      </h4>
                      <p className="text-gray-600 text-xs mb-1">
                        {formatTanggal(ujian.tanggalUjian)}
                      </p>
                      <p className="text-gray-500 text-xs">{ujian.waktu} Menit</p>
                    </div>
                  ))}
                  {ujianAkanDatang.length > 3 && (
                    <div className="text-center pt-2 border-t border-gray-200">
                      <Link
                        href="/siswa/manajemen-jawaban"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Lihat {ujianAkanDatang.length - 3} ujian lainnya →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="w-12 h-12 text-gray-400 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">Tidak ada ujian dalam 3 hari ke depan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SiswaLayout>
  )
}
