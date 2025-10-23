// resources/js/Pages/Dashboard/Staf.tsx
import React from 'react'
import { Head, Link } from '@inertiajs/react'
import Chart from 'react-apexcharts'
import StafLayout from '~/Layouts/StafLayouts'

interface DashboardProps {
  stats: any
  chartData: any
  additionalData: any
  user: {
    fullName: string
    nip: string
    departemen: string
    role: string
  }
}

export default function DashboardStaf({ stats, chartData, additionalData, user }: DashboardProps) {
  // Render berbeda berdasarkan departemen
  const renderDashboardContent = () => {
    switch (user.departemen) {
      case 'Administrasi':
        return (
          <AdminDashboard stats={stats} chartData={chartData} additionalData={additionalData} />
        )
      case 'Keuangan':
        return (
          <FinanceDashboard stats={stats} chartData={chartData} additionalData={additionalData} />
        )
      case 'Multimedia':
        return (
          <MultimediaDashboard
            stats={stats}
            chartData={chartData}
            additionalData={additionalData}
          />
        )
      default:
        return <DefaultDashboard stats={stats} user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head title={`Dashboard ${user.departemen}`} />
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Selamat Datang, {user.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  NIP: {user.nip} | {user.departemen} | Dashboard Monitoring
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {renderDashboardContent()}
        </div>
      </div>
    </div>
  )
}

// Komponen Dashboard Administrasi
const AdminDashboard = ({ stats, chartData, additionalData }: any) => {
  const userDistributionOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: chartData.userDistribution?.map((d: any) => d.name) || [],
    colors: chartData.userDistribution?.map((d: any) => d.color) || [],
    legend: {
      position: 'bottom',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%'
      },
    },
  }

  const userDistributionSeries = chartData.userDistribution?.map((d: any) => d.value) || []

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Siswa"
          value={stats.totalSiswa}
          icon="👨‍🎓"
          color="text-blue-600"
          link="/staf/manajemen-siswa"
        />
        <StatCard
          title="Total Guru"
          value={stats.totalGuru}
          icon="👨‍🏫"
          color="text-green-600"
          link="/staf/manajemen-guru"
        />
        <StatCard
          title="Kelas"
          value={stats.totalKelas}
          icon="🏫"
          color="text-purple-600"
          link="/staf/manajemen-kelas"
        />
        <StatCard
          title="Mata Pelajaran"
          value={stats.totalMapel}
          icon="📚"
          color="text-orange-600"
          link="/staf/manajemen-mapel"
        />
        <StatCard
          title="Data Wali"
          value={stats.totalWali}
          icon="👨‍👩‍👧‍👦"
          color="text-indigo-600"
          link="/staf/manajemen-wali-kelas"
        />
        <StatCard
          title="Bank Soal"
          value={stats.totalBankSoal}
          icon="📝"
          color="text-red-600"
          link="/staf/bank-soal"
        />
        <StatCard
          title="Siswa Baru"
          value={stats.siswaBaruBulanIni}
          icon="🆕"
          color="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribution Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Distribusi Pengguna
          </h3>
          {userDistributionSeries.length > 0 ? (
            <Chart
              options={userDistributionOptions}
              series={userDistributionSeries}
              type="donut"
              height={300}
            />
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data pengguna
            </div>
          )}
        </div>

        {/* Kelas List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Kelas</h3>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
              {additionalData.kelasData?.length || 0} Kelas
            </span>
          </div>
          <div className="space-y-4">
            {additionalData.kelasData?.map((kelas: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{kelas.namaKelas}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{kelas.jenjang}</p>
                </div>
                <div className="text-2xl">
                  {index % 3 === 0 ? '🏫' : index % 3 === 1 ? '📚' : '🎓'}
                </div>
              </div>
            ))}
            {(!additionalData.kelasData || additionalData.kelasData.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada data kelas
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aksi Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction
            title="Manajemen Siswa"
            icon="👥"
            color="blue"
            link="/staf/manajemen-siswa"
          />
          <QuickAction title="Manajemen Guru" icon="👨‍🏫" color="green" link="/staf/manajemen-guru" />
          <QuickAction title="Bank Soal" icon="📝" color="purple" link="/staf/bank-soal" />
          {/* <QuickAction
            title="Raport Digital"
            icon="📊"
            color="orange"
            link="/staf/raport-digital"
          /> */}
        </div>
      </div>
    </>
  )
}

// Komponen Dashboard Keuangan
const FinanceDashboard = ({ stats, chartData, additionalData }: any) => {
  const pendapatanOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: true },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: chartData.pendapatanByJenis?.map((d: any) => d.jenis) || [],
    },
    yaxis: {
      title: {
        text: 'Jumlah (Rp)',
      },
    },
    colors: ['#3B82F6'],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return 'Rp ' + val.toLocaleString('id-ID')
        },
      },
    },
  }

  const trendOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'line',
      height: 300,
      toolbar: { show: true },
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    xaxis: {
      categories: chartData.monthlyTrend?.map((d: any) => d.month) || [],
    },
    yaxis: {
      title: {
        text: 'Pendapatan (Rp)',
      },
    },
    colors: ['#10B981'],
    tooltip: {
      y: {
        formatter: function (val: number) {
          return 'Rp ' + val.toLocaleString('id-ID')
        },
      },
    },
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Pendapatan"
          value={stats.totalPendapatan}
          icon="💰"
          color="text-green-600"
          isCurrency
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={stats.totalPendapatanBulanIni}
          icon="📈"
          color="text-blue-600"
          isCurrency
        />
        <StatCard
          title="Total Tunggakan"
          value={stats.totalTunggakan}
          icon="⏰"
          color="text-red-600"
          isCurrency
        />
        <StatCard
          title="Total Transaksi"
          value={stats.totalTransaksi}
          icon="🧾"
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Pendapatan by Jenis */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Pendapatan per Jenis
          </h3>
          {chartData.pendapatanByJenis?.length > 0 ? (
            <Chart
              options={pendapatanOptions}
              series={[
                { name: 'Pendapatan', data: chartData.pendapatanByJenis.map((d: any) => d.total) },
              ]}
              type="bar"
              height={300}
            />
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data pendapatan
            </div>
          )}
        </div>

        {/* Trend Bulanan */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Trend Pendapatan 6 Bulan
          </h3>
          {chartData.monthlyTrend?.length > 0 ? (
            <Chart
              options={trendOptions}
              series={[
                { name: 'Pendapatan', data: chartData.monthlyTrend.map((d: any) => d.total) },
              ]}
              type="line"
              height={300}
            />
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data trend
            </div>
          )}
        </div>
      </div>

      {/* Pembayaran Terbaru & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pembayaran Terbaru */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Pembayaran Terbaru
          </h3>
          <div className="space-y-4">
            {additionalData.pembayaranTerbaru?.map((pembayaran: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {pembayaran.jenis}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rp {parseInt(pembayaran.nominal).toLocaleString('id-ID')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pembayaran.status === 'Lunas'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }`}
                >
                  {pembayaran.status}
                </span>
              </div>
            ))}
            {(!additionalData.pembayaranTerbaru ||
              additionalData.pembayaranTerbaru.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada data pembayaran
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aksi Cepat</h3>
          <div className="grid grid-cols-1 gap-4">
            <QuickAction
              title="Laporan Pembayaran"
              icon="📊"
              color="blue"
              link="/staf/laporan-pembayaran"
            />
            <QuickAction
              title="Broadcast WhatsApp"
              icon="💬"
              color="green"
              link="/staf/broadcast-whatsapp"
            />
          </div>
        </div>
      </div>
    </>
  )
}

// Komponen Dashboard Multimedia
const MultimediaDashboard = ({ stats, chartData, additionalData }: any) => {
  const contentDistributionOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      height: 300,
    },
    labels: chartData.contentDistribution?.map((d: any) => d.name) || [],
    colors: chartData.contentDistribution?.map((d: any) => d.color) || [],
    legend: {
      position: 'bottom',
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return Math.round(val) + '%'
      },
    },
  }

  const blogStatsOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 300,
    },
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            fontSize: '22px',
          },
          value: {
            fontSize: '16px',
          },
          total: {
            show: true,
            label: 'Total Blog',
            formatter: function () {
              return stats.totalBlog.toString()
            },
          },
        },
      },
    },
    labels: chartData.blogStats?.map((d: any) => d.name) || [],
    colors: chartData.blogStats?.map((d: any) => d.color) || [],
  }

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Blog"
          value={stats.totalBlog}
          icon="📝"
          color="text-blue-600"
          link="/staf/blogs"
        />
        <StatCard
          title="Blog Published"
          value={stats.blogPublished}
          icon="✅"
          color="text-green-600"
        />
        <StatCard
          title="Aktivitas"
          value={stats.totalAktivitas}
          icon="🎯"
          color="text-purple-600"
          link="/staf/aktivitas"
        />
        <StatCard
          title="Ads Aktif"
          value={stats.adsAktif}
          icon="📢"
          color="text-orange-600"
          link="/staf/ads"
        />
        <StatCard title="Total Views" value={stats.totalViews} icon="👀" color="text-red-600" />
        <StatCard
          title="Aktivitas Published"
          value={stats.aktivitasPublished}
          icon="📅"
          color="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Content Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Distribusi Konten
          </h3>
          {chartData.contentDistribution?.length > 0 ? (
            <Chart
              options={contentDistributionOptions}
              series={chartData.contentDistribution.map((d: any) => d.value)}
              type="pie"
              height={300}
            />
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data konten
            </div>
          )}
        </div>

        {/* Blog Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Statistik Blog</h3>
          {chartData.blogStats?.length > 0 ? (
            <Chart
              options={blogStatsOptions}
              series={chartData.blogStats.map((d: any) => d.value)}
              type="radialBar"
              height={300}
            />
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Tidak ada data blog
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Blog Populer */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Blog Terpopuler</h3>
          <div className="space-y-4">
            {additionalData.blogPopuler?.map((blog: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                    {blog.judul}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {blog.dilihat} views
                  </p>
                </div>
                <div className="text-2xl ml-4">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📄'}
                </div>
              </div>
            ))}
            {(!additionalData.blogPopuler || additionalData.blogPopuler.length === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Tidak ada data blog
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Upcoming Activities */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Aksi Cepat</h3>
            <div className="grid grid-cols-2 gap-4">
              <QuickAction title="Blog" icon="📝" color="blue" link="/staf/blogs" />
              <QuickAction title="Aktivitas" icon="🎯" color="green" link="/staf/aktivitas" />
              <QuickAction title="Ads" icon="📢" color="purple" link="/staf/ads" />
              <QuickAction
                title="Informasi"
                icon="📢"
                color="orange"
                link="/staf/manajemen-informasi"
              />
            </div>
          </div>

          {/* Upcoming Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Aktivitas Mendatang
            </h3>
            <div className="space-y-3">
              {additionalData.upcomingAktivitas?.map((aktivitas: any, index: number) => (
                <div
                  key={index}
                  className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                >
                  <p className="font-medium text-blue-900 dark:text-blue-300 text-sm">
                    {aktivitas.nama}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    {new Date(aktivitas.tanggalPelaksanaan).toLocaleDateString('id-ID')}
                  </p>
                </div>
              ))}
              {(!additionalData.upcomingAktivitas ||
                additionalData.upcomingAktivitas.length === 0) && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  Tidak ada aktivitas mendatang
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Komponen Dashboard Default
const DefaultDashboard = ({ stats, user }: any) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Selamat Datang, {user.fullName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Anda login sebagai {user.departemen || 'Staf'}. Dashboard khusus untuk departemen Anda
          sedang dalam pengembangan.
        </p>
        <Link
          href="/profile"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Lihat Profil
        </Link>
      </div>
    </div>
  )
}

// Komponen StatCard yang Diperbarui
const StatCard = ({
  title,
  value,
  icon,
  color,
  trendData,
  link,
  isCurrency = false,
}: {
  title: string
  value: number
  icon: string
  color: string
  trendData?: { value: string; color: string; icon: string; text: string }
  link?: string
  isCurrency?: boolean
}) => {
  const formattedValue = isCurrency
    ? `Rp ${value.toLocaleString('id-ID')}`
    : value.toLocaleString('id-ID')

  const content = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className="flex justify-between relative h-[80px] items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{formattedValue}</p>
          {trendData && (
            <div className="mt-2">
              <span className={`text-sm mr-1`}>{trendData.icon}</span>
              <span className={`text-xs ${trendData.color} text-nowrap`}>
                {trendData.value}% {trendData.text}
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-xl ${color} bg-opacity-10 absolute right-0`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )

  return link ? <Link href={link}>{content}</Link> : content
}

// Komponen QuickAction
const QuickAction = ({
  title,
  icon,
  color,
  link,
}: {
  title: string
  icon: string
  color: string
  link: string
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    green:
      'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    purple:
      'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300',
    orange:
      'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300',
    red: 'bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
  }

  return (
    <Link
      href={link}
      className={`p-4 rounded-lg border transition-colors text-center ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <p className="font-medium text-sm">{title}</p>
    </Link>
  )
}

DashboardStaf.layout = (page: any) => <StafLayout title="Dashboard Staf">{page}</StafLayout>
