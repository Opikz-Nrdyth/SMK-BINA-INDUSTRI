import React from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import Chart from 'react-apexcharts'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

interface DashboardProps {
  stats: {
    totalSiswa: number
    totalGuru: number
    totalKelas: number
    totalMapel: number
    totalWali: number
    totalStaf: number
    absensiHariIni: number
    trends: {
      siswa: { value: string; color: string; icon: string; text: string }
      guru: { value: string; color: string; icon: string; text: string }
      absensi: { value: string; color: string; icon: string; text: string }
    }
  }
  chartData: {
    absensiTrend: Array<{ date: string; fullDate: string; total: number }>
    absensiPie: Array<{ status: string; count: number; color: string }>
  }
  pembayaranData: Array<{ jenis: string; total: number }>
  kelasData: Array<{ namaKelas: string; jenjang: string; waliKelas: string }>
}

export default function Dashboard({ stats, chartData, pembayaranData, kelasData }: DashboardProps) {
  // Configuration untuk trend chart
  const trendChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      height: 350,
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
      height: 350,
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

  // Configuration untuk pembayaran chart
  const pembayaranChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'bar',
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: true,
        distributed: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: pembayaranData.map((d) => d.jenis),
    },
    colors: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'],
    grid: {
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
    },
  }

  const pembayaranChartSeries = [
    {
      name: 'Total Pembayaran',
      data: pembayaranData.map((d) => d.total),
    },
  ]

  const StatCard = ({
    title,
    value,
    icon,
    color,
    trendData,
  }: {
    title: string
    value: number
    icon: string
    color: string
    trendData?: { value: string; color: string; icon: string; text: string }
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-300 hover:scale-105">
      <div className="flex justify-between relative h-full items-start">
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

  const KelasCard = ({ kelas, index }: { kelas: any; index: number }) => {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white text-lg">
              {kelas.namaKelas}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{kelas.jenjang}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Wali: {kelas.waliKelas}</p>
          </div>
          <div className="text-3xl opacity-80">
            {index % 3 === 0 ? '🏫' : index % 3 === 1 ? '📚' : '🎓'}
          </div>
        </div>
      </div>
    )
  }

  const { props }: any = usePage()

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <div className="min-h-screen w-full">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {props.website_name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg uppercase">
              {props.yayasan}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Siswa"
              value={stats.totalSiswa}
              icon="👨‍🎓"
              color="text-blue-600"
              trendData={stats.trends?.siswa}
            />
            <StatCard
              title="Total Guru"
              value={stats.totalGuru}
              icon="👨‍🏫"
              color="text-green-600"
              trendData={stats.trends?.guru}
            />
            <StatCard
              title="Total Kelas"
              value={stats.totalKelas}
              icon="🏫"
              color="text-purple-600"
            />
            <StatCard
              title="Absensi Hari Ini"
              value={stats.absensiHariIni}
              icon="📊"
              color="text-orange-600"
              trendData={stats.trends?.absensi}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <StatCard
              title="Mata Pelajaran"
              value={stats.totalMapel}
              icon="📚"
              color="text-red-600"
            />
            <StatCard
              title="Data Wali Murid"
              value={stats.totalWali}
              icon="👨‍👩‍👧‍👦"
              color="text-indigo-600"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            {/* Trend Chart */}
            <div className="relative xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Trend Absensi 30 Hari Terakhir
                </h3>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
                  Real-time
                </span>
              </div>
              <Chart
                options={trendChartOptions}
                series={trendChartSeries}
                type="area"
                height={350}
              />
            </div>

            {/* Pie Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Distribusi Absensi
                </h3>
                <span className="px-3 text-nowrap py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                  Bulan Ini
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
                <div className="h-350 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Tidak ada data absensi
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Pembayaran Chart */}
            <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ringkasan Pembayaran
                </h3>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-full text-sm font-medium">
                  Total
                </span>
              </div>
              {pembayaranData.length > 0 ? (
                <div className="dark:!text-white">
                  <Chart
                    options={pembayaranChartOptions}
                    series={pembayaranChartSeries}
                    type="bar"
                    height={150}
                  />
                </div>
              ) : (
                <div className="h-300 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Tidak ada data pembayaran
                </div>
              )}
            </div>

            {/* Kelas List */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daftar Kelas</h3>
                <Link
                  href="/SuperAdmin/manajemen-kelas"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Lihat Semua
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kelasData.map((kelas, index) => (
                  <KelasCard key={index} kelas={kelas} index={index} />
                ))}
                {kelasData.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    Tidak ada data kelas
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

Dashboard.layout = (page: any) => (
  <SuperAdminLayout title="Dashboard Super Admin">{page}</SuperAdminLayout>
)
