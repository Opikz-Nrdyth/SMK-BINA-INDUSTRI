// resources/js/Pages/Dashboard/Guru.tsx
import React from 'react'
import { Head, Link } from '@inertiajs/react'
import Chart from 'react-apexcharts'
import GuruLayout from '~/Layouts/GuruLayouts'

interface DashboardProps {
  stats: {
    totalSiswa: number
    totalKelas: number
    totalMapel: number
    absensiHariIni: number
    trends: {
      absensi: { value: string; color: string; icon: string; text: string }
    }
  }
  chartData: {
    absensiTrend: Array<{ date: string; fullDate: string; total: number }>
    absensiPie: Array<{ status: string; count: number; color: string }>
  }
  kelasData: Array<{ namaKelas: string; jumlahSiswa: number }>
  user: {
    fullName: string
    nip: string
  }
}

export default function DashboardGuru({ stats, chartData, kelasData, user }: DashboardProps) {
  // Configuration untuk trend chart
  const trendChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 300,
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: true,
      },
      foreColor: '#6B7280',
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
      width: 3,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartData.absensiTrend.map((d) => d.date),
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      min: 0,
      tickAmount: 5,
    },
    tooltip: {
      x: {
        format: 'dd/MM/yyyy',
      },
    },
    colors: ['#3B82F6'],
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
    },
  }

  const trendChartSeries = [
    {
      name: 'Jumlah Absensi',
      data: chartData.absensiTrend.map((d) => d.total),
    },
  ]

  // Configuration untuk pie chart
  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'donut',
      height: 300,
    },
    labels: chartData.absensiPie.map((d) => d.status),
    colors: chartData.absensiPie.map((d) => d.color),
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: '#6B7280',
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: true,
      dropShadow: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  }

  const pieChartSeries = chartData.absensiPie.map((d) => d.count)

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trendData,
    link,
  }: {
    title: string
    value: number
    icon: string
    color: string
    trendData?: { value: string; color: string; icon: string; text: string }
    link?: string
  }) => {
    const content = (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:p-4 hover:shadow-md transition-all duration-300 hover:scale-105 cursor-pointer">
        <div className="flex justify-between relative h-[80px] items-start">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value.toLocaleString()}
            </p>
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

  const KelasCard = ({ kelas, index }: { kelas: any; index: number }) => {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
              {kelas.namaKelas}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {kelas.jumlahSiswa} Siswa
            </p>
          </div>
          <div className="text-3xl opacity-80">
            {index % 3 === 0 ? '🏫' : index % 3 === 1 ? '📚' : '🎓'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:max-w-7xl mx-auto lg:p-6">
      <div className="min-h-screen w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col-reverse md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Selamat Datang, {user.fullName}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  NIP: {user.nip} | Dashboard Monitoring Kelas
                </p>
              </div>
              <div className="text-right w-full md:w-fit">
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Siswa"
              value={stats.totalSiswa}
              icon="👨‍🎓"
              color="text-blue-600"
              link="/guru/manajemen-siswa"
            />
            <StatCard
              title="Kelas Diampu"
              value={stats.totalKelas}
              icon="🏫"
              color="text-green-600"
            />
            <StatCard
              title="Mapel Diampu"
              value={stats.totalMapel}
              icon="📚"
              color="text-purple-600"
            />
            <StatCard
              title="Absensi Hari Ini"
              value={stats.absensiHariIni}
              icon="📊"
              color="text-orange-600"
              trendData={stats.trends?.absensi}
              link="/guru/laporan-absensi"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trend Absensi 7 Hari Terakhir
                </h3>
                <span className="px-3 text-nowrap py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                  Kelas Diampu
                </span>
              </div>
              <Chart
                options={trendChartOptions}
                series={trendChartSeries}
                type="area"
                height={300}
              />
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Distribusi Absensi Bulan Ini
                </h3>
                <span className="px-3 text-nowrap py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                  Status
                </span>
              </div>
              {chartData.absensiPie.length > 0 ? (
                <div className="flex relative justify-center">
                  <Chart
                    options={pieChartOptions}
                    series={pieChartSeries}
                    type="donut"
                    width={350}
                  />
                </div>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Tidak ada data absensi
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aksi Cepat</h3>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                  Menu
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Link
                  href="/guru/manajemen-siswa"
                  className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👥</div>
                    <p className="font-medium text-blue-700 dark:text-blue-300">Data Siswa</p>
                  </div>
                </Link>
                <Link
                  href="/guru/bank-soal"
                  className="bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="font-medium text-green-700 dark:text-green-300">Bank Soal</p>
                  </div>
                </Link>
                <Link
                  href="/guru/laporan-absensi"
                  className="bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <p className="font-medium text-purple-700 dark:text-purple-300">Absensi</p>
                  </div>
                </Link>
                <Link
                  href="/guru/manajemen-informasi"
                  className="bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📢</div>
                    <p className="font-medium text-orange-700 dark:text-orange-300">Pengumuman</p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Kelas List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Kelas Diampu</h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                  {kelasData.length} Kelas
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kelasData.map((kelas, index) => (
                  <KelasCard key={index} kelas={kelas} index={index} />
                ))}
                {kelasData.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    Tidak ada kelas yang diampu
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Terakhir diperbarui: {new Date().toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardGuru.layout = (page: any) => <GuruLayout title="Dashboard Guru">{page}</GuruLayout>
