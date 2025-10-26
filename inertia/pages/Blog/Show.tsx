// resources/js/Pages/Blog/Show.tsx
import { usePage } from '@inertiajs/react'
import React from 'react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { formatDateTimeLocal } from '~/Components/FormatWaktu'

export default function Show({ blog }: any) {
  const { props } = usePage()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />

      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{blog.judul}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(blog.status)}`}
              >
                {blog.status.toUpperCase()}
              </span>
              <span className="text-gray-600 dark:text-gray-400">{blog.dilihat} views</span>
            </div>
          </div>
          <a
            href={`/admin/blogs/${blog.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Edit Blog
          </a>
        </div>

        {/* Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <strong>Penulis:</strong> {blog.penulis?.nama || 'Unknown'}
          </div>
          <div>
            <strong>Kategori:</strong> {blog.kategori || '-'}
          </div>
          <div>
            <strong>Published:</strong>{' '}
            {blog.publishedAt ? formatDateTimeLocal(blog.publishedAt) : '-'}
          </div>
          <div>
            <strong>Created:</strong> {formatDateTimeLocal(blog.createdAt)}
          </div>
          <div>
            <strong>Updated:</strong> {formatDateTimeLocal(blog.updatedAt)}
          </div>
          <div>
            <strong>Slug:</strong> {blog.slug}
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-4">
            <strong className="text-gray-700 dark:text-gray-300">Tags:</strong>
            <div className="flex flex-wrap gap-2 mt-2">
              {blog.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {blog.thumbnail && (
        <div className="mb-8">
          <img
            src={blog.thumbnail}
            alt={blog.judul}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      )}

      {/* Ringkasan */}
      {blog.ringkasan && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Ringkasan:</h3>
          <p className="text-blue-800 dark:text-blue-200">{blog.ringkasan}</p>
        </div>
      )}

      {/* Konten */}
      <div className="prose max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: blog.konten }} className="blog-content" />
      </div>
    </div>
  )
}

Show.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole === 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
