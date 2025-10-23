import React, { useState, useEffect } from 'react'
import { Head, Link, router, usePage } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { timeFormat } from '~/Components/FormatWaktu'

export default function BlogList({ news, search: initialSearch, filter: initialFilter }: any) {
  const [filter, setFilter] = useState(initialFilter || 'all')
  const [searchTerm, setSearchTerm] = useState(initialSearch || '')

  const { props } = usePage()
  const { data, meta } = news

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      const currentSearch = props.search || ''
      const currentFilter = props.filter || ''

      // hanya kirim request baru kalau nilai search / filter berubah
      if (searchTerm !== currentSearch || filter !== currentFilter) {
        router.get(
          '/blog',
          { search: searchTerm, filter: filter },
          { preserveScroll: true, replace: true, preserveState: true }
        )
      }
    }, 500)

    return () => clearTimeout(t)
  }, [searchTerm, filter])

  // Categories
  const categories = ['all', 'Teknologi', 'Pendidikan', 'Umum', 'Berita']

  const formatViews = (views: number) => {
    if (views >= 1000) return (views / 1000).toFixed(1) + 'k'
    return views.toString()
  }

  return (
    <>
      <Head title="Blog & Artikel" />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-aos="fade-up">
              Blog & Artikel
            </h1>
            <p className="text-xl opacity-90" data-aos="fade-up" data-aos-delay="200">
              Informasi, tips, dan berita terbaru seputar pendidikan dan kegiatan sekolah
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
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari artikel..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-80 px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                  />
                  <svg
                    className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
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

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 justify-center" data-aos="fade-left">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilter(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      filter === category
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category === 'all' ? 'Semua Kategori' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="text-center mb-8" data-aos="fade-up">
              <p className="text-gray-600 dark:text-gray-400">
                Menampilkan halaman {meta.currentPage} dari {meta.lastPage} — total {meta.total}{' '}
                artikel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.map((post: any, index: any) => (
                <article
                  key={post.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 100}
                  className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden group cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={`/storage/blogs/${post.thumbnail}`}
                        alt={post.judul}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {post.kategori}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span>
                          {timeFormat(post.publishedAt ?? post.createdAt, {
                            mode: 'date',
                            withDay: true,
                          })}
                        </span>
                        <span className="mx-2">•</span>
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {formatViews(post.dilihat)}
                        </div>
                      </div>

                      <h2 className="font-bold text-xl mb-3 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                        {post.judul}
                      </h2>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {post.ringkasan.split(' ').slice(0, 30).join(' ') +
                          (post.ringkasan.split(' ').length > 30 ? '...' : '')}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                              {post.penulis.fullName
                                .split(' ')
                                .map((n: any) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {post.penulis.fullName}
                          </span>
                        </div>

                        <span className="text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                          Baca Selengkapnya →
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        <span className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                          #{post.tags}
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Empty State */}
            {data.length === 0 && (
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
                  Artikel tidak ditemukan
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  Coba ubah kata kunci pencarian atau filter kategori
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

BlogList.layout = (page: any) => <GuestLayout>{page}</GuestLayout>
