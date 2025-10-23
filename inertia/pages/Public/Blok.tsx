// resources/js/Pages/Blog/Public/Index.tsx
import { usePage, router } from '@inertiajs/react'
import React, { useState } from 'react'
import { formatDateTimeLocal } from '~/Components/FormatWaktu'

export default function PublicIndex({
  blogs,
  blogsPaginate,
  kategoriList,
  searchQuery = '',
  filterKategori = '',
}: any) {
  const [search, setSearch] = useState(searchQuery)
  const [kategori, setKategori] = useState(filterKategori)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get(
      '/blog',
      { search, kategori },
      {
        preserveState: true,
        replace: true,
      }
    )
  }

  const handleKategoriChange = (newKategori: string) => {
    setKategori(newKategori)
    router.get(
      '/blog',
      { search, kategori: newKategori },
      {
        preserveState: true,
        replace: true,
      }
    )
  }

  const truncateText = (text: string, length: number) => {
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Blog & Artikel</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Temukan artikel menarik seputar pendidikan, teknologi, dan informasi terbaru
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari artikel..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <select
              value={kategori}
              onChange={(e) => handleKategoriChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((kat: string) => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Cari
            </button>
          </form>
        </div>

        {/* Blog Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <article
                key={blog.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {blog.thumbnail && (
                  <img src={blog.thumbnail} alt={blog.judul} className="w-full h-48 object-cover" />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {blog.kategori}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTimeLocal(blog.publishedAt)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                    <a
                      href={`/blog/${blog.id}`}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {blog.judul}
                    </a>
                  </h2>

                  {blog.ringkasan && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {blog.ringkasan}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      By {blog.penulis?.nama || 'Admin'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {blog.dilihat} views
                    </span>
                  </div>

                  {blog.tags && blog.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {blog.tags.slice(0, 3).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              Tidak ada artikel ditemukan
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Coba ubah kata kunci pencarian atau filter kategori
            </p>
          </div>
        )}

        {/* Pagination */}
        {blogsPaginate.lastPage > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              {/* Previous Page */}
              {blogsPaginate.currentPage > 1 && (
                <button
                  onClick={() =>
                    router.get('/blog', {
                      page: blogsPaginate.currentPage - 1,
                      search,
                      kategori,
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
              )}

              {/* Page Numbers */}
              {Array.from({ length: blogsPaginate.lastPage }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => router.get('/blog', { page, search, kategori })}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    page === blogsPaginate.currentPage
                      ? 'text-white bg-purple-600 border border-purple-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Page */}
              {blogsPaginate.currentPage < blogsPaginate.lastPage && (
                <button
                  onClick={() =>
                    router.get('/blog', {
                      page: blogsPaginate.currentPage + 1,
                      search,
                      kategori,
                    })
                  }
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
