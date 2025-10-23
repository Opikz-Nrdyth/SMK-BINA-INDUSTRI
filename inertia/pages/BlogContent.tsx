import React, { useState, useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { timeFormat } from '~/Components/FormatWaktu'

export default function BlogDetail() {
  const { props }: any = usePage()
  const { post, relatedPosts } = props

  const [currentPost, setCurrentPost] = useState(post)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })

    // Tambahkan +1 view (dari backend sudah diupdate juga)
    setCurrentPost((prev: any) => ({
      ...prev,
      views: prev.views + 1,
    }))
  }, [post])

  const displayPost = currentPost
  const displayRelatedPosts = relatedPosts

  const formatViews = (views: number) => {
    if (views >= 1000) return (views / 1000).toFixed(1) + 'k'
    return views?.toString() ?? '0'
  }

  const shareToFacebook = (url: any) => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToTwitter = (url: any, title: any) => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(
      title
    )}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
  }

  const shareToInstagram = () => {
    window.open('https://www.instagram.com/', '_blank')
  }

  return (
    <>
      <Head title={displayPost.title} />

      {/* Hero Section */}
      <section className="relative py-20 darktext-white text-black">
        <div className="absolute inset-0"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span className="bg-black/40 dark:bg-white/40 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                {displayPost.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 dark:text-white">
              {displayPost.title}
            </h1>
            <div className="flex flex-wrap justify-center items-center gap-4 text-lg opacity-90">
              <div className="flex items-center dark:text-white">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {displayPost.author}
              </div>
              <div className="flex items-center dark:text-white">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {timeFormat(displayPost.published_at, { mode: 'date', withDay: true })}
              </div>
              <div className="flex items-center dark:text-white">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                {formatViews(displayPost.views)} dilihat
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Content */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Featured Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={displayPost.thumbnail}
                alt={displayPost.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Article Content */}
            <article className="prose prose-lg dark:prose-invert max-w-none">
              <div
                className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: displayPost.content }}
              />
            </article>

            {/* Tags */}
            {displayPost.tags && displayPost.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {displayPost.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors duration-300 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-4 mb-1">
              Bagikan:
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  shareToFacebook(window.location.href)
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <i className="fa-brands fa-facebook-f text-lg"></i>
                <span>Facebook</span>
              </button>

              <button
                onClick={() => {
                  shareToTwitter(window.location.href, post.title)
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <i className="fa-brands fa-x-twitter text-lg"></i>
                <span>Tweet</span>
              </button>

              <button
                onClick={shareToInstagram}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-pink-600 via-red-500 to-yellow-400 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <i className="fa-brands fa-instagram text-lg"></i>
                <span>Instagram</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {displayRelatedPosts && displayRelatedPosts.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
          <div className="container mx-auto px-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Artikel Terkait
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Temukan artikel menarik lainnya yang mungkin Anda sukai
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {displayRelatedPosts.map((relatedPost: any, index: number) => (
                  <article
                    key={relatedPost.id}
                    className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden group cursor-pointer transform transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  >
                    <Link href={`/blog/${relatedPost.slug}`}>
                      {/* Thumbnail */}
                      <div className="relative overflow-hidden h-48">
                        <img
                          src={relatedPost.thumbnail}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            {relatedPost.category}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                          <span>
                            {timeFormat(relatedPost.published_at, { mode: 'date', withDay: true })}
                          </span>
                          <span className="mx-2">•</span>
                          <span>{formatViews(relatedPost.views)} dilihat</span>
                        </div>

                        <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 line-clamp-2">
                          {relatedPost.title}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                          {relatedPost.summary}
                        </p>

                        <div className="mt-4">
                          <span className="text-purple-600 dark:text-purple-400 font-medium text-sm group-hover:translate-x-1 transition-transform duration-300">
                            Baca Selengkapnya →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* Back to Blog List */}
              <div className="text-center mt-12">
                <Link
                  href="/blog"
                  className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300 font-medium"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Kembali ke Daftar Artikel
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

BlogDetail.layout = (page: any) => {
  return <GuestLayout>{page}</GuestLayout>
}
