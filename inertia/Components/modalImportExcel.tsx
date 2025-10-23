import React, { useState } from 'react'

interface ModalImportExcelProps {
  open: boolean
  onClose: () => void
  onSubmit: (file: File) => void
  loading?: boolean
}

const ModalImportExcel: React.FC<ModalImportExcelProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)

  if (!open) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected && selected.name.endsWith('.xlsx')) {
      setFile(selected)
    } else {
      alert('Hanya file .xlsx yang diperbolehkan!')
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped && dropped.name.endsWith('.xlsx')) {
      setFile(dropped)
    } else {
      alert('Hanya file .xlsx yang diperbolehkan!')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return alert('Pilih file terlebih dahulu!')
    onSubmit(file)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-700 transition-all">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
          Import Data Siswa
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Unggah file Excel (.xlsx) sesuai format template.
        </p>

        <form onSubmit={handleSubmit}>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <input
              type="file"
              id="fileInput"
              accept=".xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 mx-auto mb-3 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-300">
              {file ? (
                <>
                  <span className="font-medium">{file.name}</span>
                  <span className="block text-xs text-gray-400">Klik untuk ubah file</span>
                </>
              ) : (
                <>
                  <span className="font-medium text-blue-600 dark:text-blue-400">Klik</span> atau{' '}
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    seret file Excel
                  </span>{' '}
                  ke sini
                </>
              )}
            </p>
          </div>

          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition ${
                file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Mengimpor...' : 'Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalImportExcel
