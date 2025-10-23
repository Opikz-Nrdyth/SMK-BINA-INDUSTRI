import { Head, Link } from '@inertiajs/react'

export default function PPDBSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
      <Head title="Pendaftaran Berhasil - PPDB" />

      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Pendaftaran Berhasil!
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Data pendaftaran Anda telah berhasil disimpan. Silakan tunggu informasi selanjutnya
            melalui email atau WhatsApp.
          </p>

          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
