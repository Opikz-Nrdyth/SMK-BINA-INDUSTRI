// resources/js/Components/NotificationProvider.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'any'

interface Notification {
  id: number
  message: string
  type: NotificationType
  duration: number
}

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification harus dipakai di dalam <NotificationProvider>')
  return context
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [durationNotif, setDuration] = useState(3000)

  const notify = (message: string, type: NotificationType = 'success', duration = 3000) => {
    const id = Date.now()
    const newNotif: Notification = { id, message, type, duration }
    setNotifications((prev) => [...prev, newNotif])
    if (duration) {
      setDuration(duration)
    }

    // Auto remove setelah 10 detik
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, duration)
  }

  const baseStyle =
    'relative flex items-center p-4 mb-3 w-80 text-sm rounded-lg border shadow-lg overflow-hidden transition-all duration-500 bg-opacity-90 backdrop-blur-md'

  const types = {
    info: 'text-blue-800 border-blue-300 bg-blue-100 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    error:
      'text-red-800 border-red-300 bg-red-100 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    success:
      'text-green-800 border-green-300 bg-green-100 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    warning:
      'text-yellow-800 border-yellow-300 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
    any: 'text-gray-800 border-gray-300 bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700',
  }

  const colors = {
    info: 'bg-blue-500',
    error: 'bg-red-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-400',
    any: 'bg-gray-400',
  }

  const icons = {
    info: 'ℹ️',
    error: '❌',
    success: '✅',
    warning: '⚠️',
    any: '💬',
  }

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="fixed bottom-5 md:top-5 md:right-5 z-[1000] h-fit w-full md:w-fit flex flex-col items-center md:items-end space-y-2">
        {notifications.map((notif) => (
          <div key={notif.id} className={`${baseStyle} ${types[notif.type]} animate-fade-in`}>
            <span className="mr-2">{icons[notif.type]}</span>
            <div>
              <span className="font-medium capitalize">{notif.type}:</span> {notif.message}
            </div>

            {/* progress line di border bawah */}
            <div
              className={`absolute bottom-0 left-0 h-[3px] ${colors[notif.type]} animate-progress-line`}
            ></div>
          </div>
        ))}
      </div>

      <style>
        {`
          /* Fade in muncul */
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-in-out;
          }

          /* Progress border bawah */
          @keyframes progressLine {
            from { width: 100%; }
            to { width: 0%; }
          }
          .animate-progress-line {
            animation: progressLine ${durationNotif / 1000}s linear forwards;
          }
        `}
      </style>
    </NotificationContext.Provider>
  )
}
