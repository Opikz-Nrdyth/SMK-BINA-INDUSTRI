import { formatDateTimeLocal } from '~/Components/FormatWaktu'

export default function PublicShow({ blog, relatedBlogs }: any) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.judul,
          text: blog.ringkasan,
          url: shareUrl,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert('Link berhasil disalin!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Article Header */}
      <article className="bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <a href="/" className="hover:text-purple-600">
              Home
            </a>
            <span>›</span>
            <a href="/blog" className="hover:text-purple-600">
              Blog
            </a>
            <span>›</span>
            <span className="text-gray-400">Artikel</span>
          </nav>

          {/* Article Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-sm font-medium">
                {blog.kategori}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {formatDateTimeLocal(blog.publishedAt)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">{blog.dilihat} views</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{blog.judul}</h1>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-300 font-semibold">
                    {blog.penulis?.nama?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {blog.penulis?.nama || 'Admin'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Penulis</p>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                Bagikan
              </button>
            </div>
          </div>

          {/* Thumbnail */}
          {blog.thumbnail && (
            <div className="mb-8">
              <img
                src={blog.thumbnail}
                alt={blog.judul}
                className="w-full h-96 object-cover rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Ringkasan */}
          {blog.ringkasan && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r-lg mb-8">
              <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
                {blog.ringkasan}
              </p>
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-strong:text-gray-900 dark:prose-strong:text-white prose-a:text-purple-600 hover:prose-a:text-purple-700 prose-blockquote:border-purple-600 prose-blockquote:bg-purple-50 dark:prose-blockquote:bg-purple-900/20 dark:prose-blockquote:text-purple-200">
            <div dangerouslySetInnerHTML={{ __html: blog.konten }} className="blog-content" />
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-purple-100 dark:hover:bg-purple-900 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Related Posts */}
      {relatedBlogs && relatedBlogs.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Artikel Terkait</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedBlogs.map((relatedBlog: any) => (
              <article
                key={relatedBlog.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {relatedBlog.thumbnail && (
                  <img
                    src={relatedBlog.thumbnail}
                    alt={relatedBlog.judul}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {relatedBlog.kategori}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTimeLocal(relatedBlog.publishedAt)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <a
                      href={`/blog/${relatedBlog.id}`}
                      className="hover:text-purple-600 transition-colors"
                    >
                      {relatedBlog.judul}
                    </a>
                  </h3>

                  <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                    {relatedBlog.ringkasan}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
