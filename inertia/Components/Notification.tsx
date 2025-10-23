import React, { useState, useEffect, FC } from 'react'
import { usePage } from '@inertiajs/react'

export const Notification: FC = () => {
  const {
    props: { flashMessages },
  } = usePage<{ flashMessages?: { success?: string; error?: string } }>()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('success')

  useEffect(() => {
    const { success, error } = flashMessages || {}
    if (success || error) {
      setMessage(success || error || '')
      setType(success ? 'success' : 'error')
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [flashMessages])

  if (!visible) return null
  const baseClasses =
    'fixed top-5 right-5 z-[100] px-6 py-4 rounded-lg shadow-lg text-white text-sm font-semibold'
  const typeClasses = type === 'success' ? 'bg-green-500' : 'bg-red-500'
  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>
}
