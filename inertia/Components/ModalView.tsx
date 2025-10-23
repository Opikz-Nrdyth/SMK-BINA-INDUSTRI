import React from 'react'

interface ModalViewProps {
  open: boolean
  onClose: () => void
  data: Record<string, any>
  title?: string
  exclude?: string[] // contoh: ["id", "user.id", "dataWalis.nik"]
  include?: string[] // contoh: ["id", "user.id", "dataWalis.nik"] - hanya menampilkan field yang diinclude
}

export default function ModalView({
  open,
  onClose,
  data,
  title,
  exclude = [],
  include = [],
}: ModalViewProps) {
  if (!open) return null

  const formatDate = (date: string) => {
    const d = new Date(date)
    return isNaN(d.getTime())
      ? date
      : d.toLocaleDateString('id-ID', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
  }

  const formatLabel = (key: string) => {
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  const shouldRender = (key: string, parentKey: string) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key

    // Jika include diisi, maka hanya render field yang ada di include
    if (include.length > 0) {
      // 1. Wildcard → tampilkan semua key yang cocok
      if (include.some((inc) => inc.startsWith('*') && inc.slice(1) === key)) {
        return true
      }

      // 2. Exact match (full path) → tampilkan spesifik
      if (include.includes(fullKey)) {
        return true
      }

      // 3. Local key → tampilkan hanya di level ini
      if (include.includes(key) && !parentKey) {
        return true
      }

      return false
    }

    // Jika include kosong, gunakan exclude logic
    // 1. Wildcard → buang semua key yang cocok
    if (exclude.some((ex) => ex.startsWith('*') && ex.slice(1) === key)) {
      return false
    }

    // 2. Exact match (full path) → buang spesifik
    if (exclude.includes(fullKey)) {
      return false
    }

    // 3. Local key → buang hanya di level ini
    if (exclude.includes(key) && !parentKey) {
      return false
    }

    return true
  }

  const renderFields = (obj: Record<string, any>, parentKey = '') => {
    return Object.entries(obj).map(([key, value]) => {
      if (!shouldRender(key, parentKey)) return null

      const uniqueKey = parentKey ? `${parentKey}.${key}` : key

      if (value === null || value === undefined || value === '')
        return (
          <div key={uniqueKey} className="flex justify-between border-b py-1 text-sm ">
            <span className="font-medium text-gray-600 dark:text-white">{formatLabel(key)}</span>
            <span className="text-gray-900 dark:text-white">-</span>
          </div>
        )

      if (typeof value === 'object' && !Array.isArray(value)) {
        return (
          <div key={uniqueKey} className="mb-5">
            <h3 className="text-lg font-semibold mb-3 capitalize dark:text-white">
              {formatLabel(key)}
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 border">
              {renderFields(value, uniqueKey)}
            </div>
          </div>
        )
      }

      if (Array.isArray(value)) {
        return (
          <div key={uniqueKey} className="mb-5">
            <h3 className="text-lg font-semibold mb-3 capitalize dark:text-white">
              {formatLabel(key)}
            </h3>
            <div className="space-y-4">
              {value.map((item, i) => (
                <div
                  key={`${uniqueKey}[${i}]`}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 border"
                >
                  {renderFields(item, `${uniqueKey}[${i}]`)}
                </div>
              ))}
            </div>
          </div>
        )
      }

      const patterns = [
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/, // ISO 8601
      ]
      const isDate =
        typeof value === 'string' &&
        patterns.some((regex) => regex.test(value)) &&
        !isNaN(new Date(value).getTime())

      return (
        <div key={uniqueKey} className="flex justify-between border-b py-1 gap-10 text-sm">
          <span className="font-medium text-gray-600 dark:text-white">{formatLabel(key)}</span>
          <span className="text-gray-900 dark:text-white text-justify">
            {isDate ? formatDate(value) : value.toString()}
          </span>
        </div>
      )
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg w-[850px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-5 py-3">
          <h2 className="text-xl font-bold">{title || 'Detail Data'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 ">{renderFields(data)}</div>
      </div>
    </div>
  )
}
