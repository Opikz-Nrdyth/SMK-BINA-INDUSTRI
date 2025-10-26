import { Head, Link, usePage } from '@inertiajs/react'
import { ReactNode, useEffect, useState } from 'react'
import { useNotification } from '~/Components/NotificationAlert'
import SplashScreen from '~/pages/SpalshScreen'

interface LayoutProps {
  title?: string
  children: ReactNode
}

export default function GuestLayout({ title, children }: LayoutProps) {
  const { props } = usePage() as any

  const { timezone } = usePage().props as { timezone?: string }
  const [now, setNow] = useState(() => new Date())
  const { notify } = useNotification()
  const [splash, setSplas] = useState(false)
  

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  if (timezone) {
    options.timeZone = timezone
  }

  const timeString = now.toLocaleTimeString(undefined, options)

  const [darkMode, setDarkMode] = useState(() => {
    // Cek localStorage dulu
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    // Jika tidak ada, cek preferensi sistem
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const themeFromStorage = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (themeFromStorage) {
      setDarkMode(themeFromStorage === 'dark')
    } else {
      setDarkMode(prefersDark)
    }

    if (!localStorage.splash) {
      setSplas(true)
    }
    localStorage.setItem('splash', 'true')
  }, [])

  useEffect(() => {
    if (props.session) {
      const session = props.session

      if (session.status == 'success') {
        notify(session.message, 'success')
      }

      if (session.status == 'error') {
        notify(session.message, 'error')
      }
    }
  }, [props])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const sideItemData = [
    {
      name: 'Beranda',
      path: '/',
    },
    {
      name: 'Profile',
      path: '/profile',
    },
    {
      name: 'Guru & Staf',
      path: '/guru-staf',
    },
    {
      name: 'Blog',
      path: '/blog',
    },
    {
      name: 'Kegiatan',
      path: '/kegiatan',
    },
    {
      name: 'PPDB',
      path: '/ppdb',
    },
    {
      name: 'Login',
      path: '/login',
    },
  ]

  return (
    <section className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {splash && <SplashScreen />}
      <Head title={title ?? ''}>
        <meta name="description" content={props.description} />
        <meta name="keywords" content={props.keywords} />
        <link rel="icon" type="image/png" href={props.logo} />
      </Head>
      <header className="bg-[#4D2C7A] dark:bg-purple-900 text-white text-xs py-2 px-4 md:px-8 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 flex-wrap">
            {props.phone ? (
              <span className="flex items-center gap-2">
                PHONE: <strong>{props.phone}</strong>
              </span>
            ) : null}
            {props.fax ? (
              <span className="hidden md:flex items-center gap-2">
                FAX: <strong>{props.fax}</strong>
              </span>
            ) : null}
            {props.email != null ? (
              <span className="hidden lg:flex items-center gap-2">
                EMAIL: <strong>{props.email}</strong>
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              SERVER: <strong>{timeString}</strong>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* BAGIAN: Navigasi Utama */}
      <nav className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-8">
          <div className="hidden md:flex w-full justify-center items-center gap-6 text-sm font-medium">
            {sideItemData.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className="hover:text-[#F43F5E] dark:hover:text-pink-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4 justify-end w-full md:hidden">
            <button
              className="text-[#4D2C7A] dark:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-800 py-4 px-8 shadow-md">
            {sideItemData.map((item, index) => (
              <Link
                key={index}
                href={item.path}
                className="block py-2 hover:text-[#F43F5E] dark:hover:text-pink-400 transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <main>{children}</main>
      <footer className="bg-[#4D2C7A] dark:bg-purple-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-bold text-xl mb-4">{props.website_name}</h3>
            <div></div>
            <iframe
              src={`https://www.google.com/maps?q=${props.long ?? 0},${props.lat ?? 0}&hl=id&z=15&output=embed`}
              width="100%"
              height="150"
              style={{ border: 0 }}
              loading="lazy"
              className="rounded-md"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Link</h3>
            <ul className="space-y-2">
              {sideItemData.map((item, index) => (
                <li key={index}>
                  <Link href={item.path} className="hover:text-pink-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mt-1 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{props.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>{props.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span>{props.email}</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-8 mt-12 text-center text-sm text-gray-400 border-t border-gray-500/30 pt-6">
          <p>
            Copyright © {new Date().getFullYear()} SMK Bina Industri | Developed by Opik Studio
          </p>
        </div>
      </footer>
    </section>
  )
}
