import React, { useState, useEffect } from 'react'

const ExamCodePopup = ({ isOpen = false, onSubmit, onCancel, initialCode = '' }) => {
  const [examCode, setExamCode] = useState(initialCode)
  const [isLoading, setIsLoading] = useState(false)

  // Reset form ketika popup dibuka
  useEffect(() => {
    if (isOpen) {
      setExamCode(initialCode)
      setIsLoading(false)
    }
  }, [isOpen, initialCode])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!examCode.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onSubmit(examCode.trim().toUpperCase())
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (!isLoading) {
      onCancel()
    }
  }

  const handleOverlayClick = (e: any) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel()
    }
  }

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e: any) => {
      if (e.keyCode === 27 && isOpen && !isLoading) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Masuk Ujian</h2>
            <button
              onClick={handleCancel}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-gray-600 text-sm mt-1">Masukkan kode ujian yang diberikan pengawas</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="examCode" className="block text-sm font-medium text-gray-700 mb-2">
              Kode Ujian
            </label>
            <input
              type="text"
              id="examCode"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value.toUpperCase())}
              placeholder="Contoh: UJN2024A"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-base font-mono uppercase tracking-wide"
              autoFocus
              maxLength={20}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Masukkan kode dengan huruf kapital
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!examCode.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                'Masuk Ujian'
              )}
            </button>
          </div>
        </form>

        {/* Footer Info */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
          <div className="flex items-center justify-center text-xs text-gray-600">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Pastikan koneksi internet stabil
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamCodePopup
