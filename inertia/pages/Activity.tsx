// resources/js/Pages/Activities.tsx

import React, { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'
import AOS from 'aos'
import 'aos/dist/aos.css'

interface Activity {
  id: string
  nama: string
  jenis: string
  deskripsi: string
  lokasi: string
  tanggalPelaksanaan: string
  dokumentasi?: string | null
  pembuat: {
    nama: string
  }
}

interface PageProps {
  activities: Activity[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  search: string
  filter: string
}

export default function Activities() {
  const {
    activities,
    meta,
    search: initialSearch,
    filter: initialFilter,
  } = usePage<PageProps>().props

  const [filter, setFilter] = useState(initialFilter || 'all')
  const [searchTerm, setSearchTerm] = useState(initialSearch || '')
  const [currentPage, setCurrentPage] = useState(meta?.current_page || 1)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })
  }, [])

  // Handle form submission untuk search dan filter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/kegiatan', {
      search: searchTerm,
      filter: filter,
      page: 1,
    })
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter)
    router.get('/kegiatan', {
      search: searchTerm,
      filter: newFilter,
      page: 1,
    })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    router.get('/kegiatan', {
      search: searchTerm,
      filter: filter,
      page: page,
    })
  }

  // Jenis kegiatan dengan label yang lebih user-friendly
  const activityTypes = [
    { value: 'all', label: 'Semua Kegiatan' },
    { value: 'ekstrakurikuler', label: 'Ekstrakurikuler' },
    { value: 'studi_tour', label: 'Studi Tour' },
    { value: 'lomba', label: 'Lomba' },
    { value: 'prestasi', label: 'Prestasi' },
    { value: 'bakti_sosial', label: 'Bakti Sosial' },
    { value: 'upacara', label: 'Upacara' },
    { value: 'lainnya', label: 'Lainnya' },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getActivityTypeColor = (jenis: string) => {
    const colors: { [key: string]: string } = {
      ekstrakurikuler: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      studi_tour: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      lomba: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      prestasi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      bakti_sosial: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      upacara: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      lainnya: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    }
    return colors[jenis] || colors.lainnya
  }

  const getActivityTypeLabel = (jenis: string) => {
    const type = activityTypes.find((t) => t.value === jenis)
    return type ? type.label : 'Lainnya'
  }

  // Generate default image jika tidak ada dokumentasi
  const getActivityImage = (activity: Activity) => {
    if (activity.dokumentasi) {
      return [activity.dokumentasi]
    }

    // Default images berdasarkan jenis kegiatan
    const defaultImages: { [key: string]: string[] } = {
      ekstrakurikuler: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&h=400&fit=crop',
      ],
      studi_tour: [
        'https://images.unsplash.com/photo-1534008897995-27a23e859048?w=600&h=400&fit=crop',
      ],
      lomba: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop'],
      prestasi: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop'],
      bakti_sosial: [
        'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop',
      ],
      upacara: [
        'https://images.unsplash.com/photo-1618519764620-7403abdbdfe9?w=600&h=400&fit=crop',
      ],
      lainnya: [
        'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600&h=400&fit=crop',
      ],
    }

    return defaultImages[activity.jenis] || defaultImages.lainnya
  }

  const totalPages = meta?.last_page || 1
  const totalActivities = meta?.total || activities.length

  return (
    <>
      <Head title="Kegiatan Sekolah" />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-aos="fade-up">
              Kegiatan Sekolah
            </h1>
            <p className="text-xl opacity-90" data-aos="fade-up" data-aos-delay="200">
              Dokumentasi berbagai aktivitas dan program unggulan SMA Negeri 1 Sleman
            </p>
          </div>
        </div>
      </section>

      {/* Filter dan Search Section */}
      <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-8">
              {/* Search Input */}
              <div className="w-full md:w-auto" data-aos="fade-right">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari kegiatan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full md:w-80 px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                    />
                    <button type="submit" className="absolute left-4 top-3.5">
                      <svg
                        className="h-5 w-5 text-gray-400"
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
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Type Filter */}
              <div className="flex flex-wrap gap-2 justify-center" data-aos="fade-left">
                {activityTypes.map((type, index) => (
                  <button
                    key={type.value}
                    onClick={() => handleFilterChange(type.value)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      filter === type.value
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="text-center mb-8" data-aos="fade-up">
              <p className="text-gray-600 dark:text-gray-400">
                Menampilkan {activities.length} dari {totalActivities} kegiatan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activities.map((activity, index) => {
                const activityImages = getActivityImage(activity)

                return (
                  <Link
                    key={activity.id}
                    href={`/kegiatan/${activity.id}`}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden group cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl block"
                  >
                    {/* Activity Image */}
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={`/storage/aktivitas/${activityImages[0]}`}
                        alt={activity.nama}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(activity.jenis)}`}
                        >
                          {getActivityTypeLabel(activity.jenis)}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Multiple Images Indicator */}
                      {activityImages.length > 1 && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
                          +{activityImages.length - 1} foto
                        </div>
                      )}
                    </div>

                    {/* Activity Content */}
                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {activity.lokasi}
                      </div>

                      <h3 className="font-bold text-xl mb-3 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                        {activity.nama}
                      </h3>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {activity.deskripsi}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {formatDate(activity.tanggalPelaksanaan)}
                        </div>

                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          {activity.pembuat?.nama || 'Admin Sekolah'}
                        </div>
                      </div>

                      {/* Hover Action */}
                      <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                            Lihat Detail →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
              <div className="text-center py-12" data-aos="fade-up">
                <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  Kegiatan tidak ditemukan
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Coba ubah kata kunci pencarian atau filter jenis kegiatan
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-12" data-aos="fade-up">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    Previous
                  </button>

                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                        currentPage === index + 1
                          ? 'bg-purple-600 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

Activities.layout = (page: any) => {
  return <GuestLayout>{page}</GuestLayout>
}
