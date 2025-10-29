import { usePage } from '@inertiajs/react'

interface ErrorData {
  code?: string
  errno?: number
  sqlState?: string
  sqlMessage?: string
  message?: string
  status?: number
  validation?: { [key: string]: string[] }
  [key: string]: any
}

export default function ServerError() {
  const { props } = usePage()
  const error: ErrorData = props.error || {}

  // Menangani error tipe HTTP (misalnya 404, 403, dsb)
  const renderHttpError = () => {
    if (error.status === 404) {
      return 'Halaman yang Anda cari tidak ditemukan.'
    } else if (error.status === 403) {
      return 'Anda tidak memiliki izin untuk mengakses halaman ini.'
    } else if (error.status === 401) {
      return 'Anda perlu login terlebih dahulu.'
    }
    return error.message || 'Terjadi kesalahan yang tidak terduga.'
  }

  // Menangani error tipe validasi (misalnya form errors)
  const renderValidationError = () => {
    if (error.validation) {
      return (
        <div className="text-left text-sm text-red-400">
          <h3 className="font-semibold">Kesalahan Validasi:</h3>
          <ul>
            {Object.entries(error.validation).map(([field, messages]) => (
              <li key={field}>
                <strong>{field}:</strong>
                <ul>
                  {messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return null
  }

  // Menangani error tipe SQL
  const renderSqlError = () => {
    if (error.sqlMessage) {
      return (
        <div className="bg-gray-800 text-left p-4 rounded-md text-sm overflow-auto max-h-64">
          <pre className="whitespace-pre-wrap break-all">
            SQL Error: {error.sqlMessage}
          </pre>
        </div>
      )
    }
    return null
  }

  // Menampilkan seluruh error
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-gray-100 px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-6xl font-bold text-red-500 mb-3">
          {error.status || 500}
        </h1>
        <h2 className="text-2xl font-semibold mb-2">
          {error.code || 'Terjadi Kesalahan'}
        </h2>

        <p className="text-gray-400 mb-6">{renderHttpError()}</p>

        {/* Menampilkan validasi error jika ada */}
        {renderValidationError()}

        {/* Menampilkan detail error SQL jika ada */}
        {renderSqlError()}

        {/* Jika error lainnya, tampilkan dalam bentuk JSON */}
        {(!error.status && !error.validation && !error.sqlMessage) && (
          <div className="bg-gray-800 text-left p-4 rounded-md text-sm overflow-auto max-h-64">
            <pre className="whitespace-pre-wrap break-all">
              {JSON.stringify(error, null, 2)}
            </pre>
          </div>
        )}

        <a
          href="/"
          className="inline-block mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white font-medium"
        >
          Kembali ke Beranda
        </a>
      </div>

      <footer className="mt-10 text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} — Aplikasi Kamu
      </footer>
    </div>
  )
}
