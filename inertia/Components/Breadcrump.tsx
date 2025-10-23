import { Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'

type Header = {
  key: string
  value: string
}
type Props = {
  header?: Header
}

export default function Breadcrumb({ header }: Props) {
  const [path, setPath] = useState('')
  useEffect(() => {
    setPath(window.location.pathname)
  })
  const parts = path.split('/').filter(Boolean)
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) {
      return text
    }
    return `${text.substring(0, maxLength)}...`
  }

  const isDynamicParam = (part: string) => {
    // hanya angka panjang
    if (/^\d{6,}$/.test(part)) return true
    // UUID
    if (/^[0-9a-fA-F-]{10,}$/.test(part)) return true
    return false
  }
  return (
    <nav className="flex " aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        {parts.length > 1 &&
          parts
            .filter((part) => !isDynamicParam(part))
            .map((part, idx) => {
              const isLast = idx === parts.length - 1
              const href = `/${parts.slice(0, idx + 1).join('/')}`

              return (
                <li key={idx} aria-current={isLast ? 'page' : undefined}>
                  <div className="flex items-center">
                    {idx > 0 && (
                      <svg
                        className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 9 4-4-4-4"
                        />
                      </svg>
                    )}

                    {isLast ? (
                      <span className="ms-1 text-sm font-medium text-gray-500 dark:text-gray-200 md:ms-2 ">
                        {truncateText(part, 20)}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        className="ms-1 text-sm font-medium text-gray-700 dark:text-gray-50 hover:text-blue-600 md:ms-2 "
                      >
                        {truncateText(part, 20)}
                      </Link>
                    )}
                  </div>
                </li>
              )
            })}
      </ol>
    </nav>
  )
}
