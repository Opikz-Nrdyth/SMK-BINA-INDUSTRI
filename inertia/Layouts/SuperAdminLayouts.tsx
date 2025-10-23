import { Head, Link, router, usePage } from '@inertiajs/react'
import { ReactNode, useEffect, useState } from 'react'
import Breadcrumb from '~/Components/Breadcrump'
import { useNotification } from '~/Components/NotificationAlert'

interface SuperAdminLayoutProps {
  title?: string
  children: ReactNode
}

export default function SuperAdminLayout({ title, children }: SuperAdminLayoutProps) {
  const { props } = usePage<any>()
  const [sideOpen, setSideOpen] = useState(true) // true = sidebar terbuka
  const [profileOpen, setProfileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    // Cek localStorage dulu
    const stored = localStorage.getItem('theme')
    if (stored) return stored === 'dark'
    // Jika tidak ada, cek preferensi sistem
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const { notify } = useNotification()

  const SideItemData = [
    {
      name: 'Dashboard',
      path: '/SuperAdmin',
      icon: 'fa-solid fa-gauge-high',
    },
    {
      name: 'Manajemen Pengguna',
      path: null,
      icon: 'fa-solid fa-user-group',
      childern: [
        {
          name: 'Manajemen Siswa',
          path: '/SuperAdmin/manajemen-siswa',
        },
        {
          name: 'Siswa Pra Regist',
          path: '/SuperAdmin/manajemen-siswa/praregist',
        },
        {
          name: 'Manajemen Guru',
          path: '/SuperAdmin/manajemen-guru',
        },
        {
          name: 'Manajemen Wali Kelas',
          path: '/SuperAdmin/manajemen-wali-kelas',
        },
        {
          name: 'Manajemen Staf',
          path: '/SuperAdmin/manajemen-staf',
        },
        {
          name: 'Manajemen Super Admin',
          path: '/SuperAdmin/data-super-admin',
        },
      ],
    },
    {
      name: 'manajemen Ujian',
      path: null,
      icon: 'fa-solid fa-file-pen',
      childern: [
        {
          name: 'Bank Soal',
          path: '/SuperAdmin/bank-soal',
        },
        {
          name: 'Manajemen Jawaban',
          path: '/SuperAdmin/manajemen-kehadiran',
        },
        {
          name: 'Partisipasi Ujian',
          path: '/SuperAdmin/partisipasi-ujian',
        },
      ],
    },
    {
      name: 'manajemen Akademik',
      path: null,
      icon: 'fa-solid fa-book-open',
      childern: [
        {
          name: 'Tahun Ajaran',
          path: '/SuperAdmin/manajemen-tahun-ajaran',
        },
        {
          name: 'Jurusan',
          path: '/SuperAdmin/manajemen-jurusan',
        },
        {
          name: 'Kelas',
          path: '/SuperAdmin/manajemen-kelas',
        },
        {
          name: 'Mata Pelajaran',
          path: '/SuperAdmin/manajemen-mapel',
        },
      ],
    },
    {
      name: 'Laporan & Hasil',
      path: null,
      icon: 'fa-solid fa-file-lines',
      childern: [
        {
          name: 'Laporan Absensi',
          path: '/SuperAdmin/laporan-absensi',
        },
        {
          name: 'Laporan Pembayaran',
          path: '/SuperAdmin/laporan-pembayaran',
        },
        {
          name: 'Laporan Nilai',
          path: '/SuperAdmin/laporan-nilai',
        },
      ],
    },
    {
      name: 'Multimedia',
      path: null,
      icon: 'fa-solid fa-icons',
      childern: [
        {
          name: 'Pengumuman',
          path: '/SuperAdmin/manajemen-informasi',
        },
        {
          name: 'Aktivitas',
          path: '/SuperAdmin/manajemen-aktivitas',
        },
        {
          name: 'Iklan',
          path: '/SuperAdmin/manajemen-ads',
        },
      ],
    },
    {
      name: 'Whatsapp Connection',
      path: '/SuperAdmin/whatsapp',
      icon: 'fa-brands fa-whatsapp',
    },

    {
      name: 'Pengaturan Website',
      path: '/SuperAdmin/landing-page',
      icon: 'fa-solid fa-gears',
    },
  ]

  // Efek untuk deteksi mobile
  useEffect(() => {
    const themeFromStorage = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (themeFromStorage) {
      setDarkMode(themeFromStorage === 'dark')
    } else {
      setDarkMode(prefersDark)
    }
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Efek untuk mengubah tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

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
    console.log(props)
  }, [props])

  const userName = props?.auth?.fullName || props?.user?.fullName
  const userRole = props?.auth?.role || props?.user?.role
  const toggleDarkMode = () => setDarkMode((prev) => !prev)

  const renderMenuItem = (item: any, index: number) => (
    <div
      className="group scrollbar-thin scrollbar-thumb-purple dark:scrollbar-thumb-dark"
      key={index}
    >
      <input type="checkbox" id={`toggle-${index}`} className="peer hidden" />
      {item.path ? (
        <Link
          href={item?.path}
          title={item.name}
          onClick={() => (isMobile ? setSideOpen(true) : setSideOpen(true))}
          className={`flex gap-4 items-center px-4 h-[50px] hover:bg-purple-600 hover:text-white cursor-pointer justify-between`}
        >
          <span className="flex gap-2 items-center dark:text-white">
            <i className={item.icon}></i>
            <span className={`${sideOpen ? 'inline' : 'inline lg:hidden'}`}>{item.name}</span>
          </span>
          {item?.childern && sideOpen && <i className="fa-solid fa-angle-down"></i>}
        </Link>
      ) : (
        <label
          htmlFor={`toggle-${index}`}
          onClick={() => !isMobile && setSideOpen(true)}
          className={`flex dark:text-white items-center px-4 h-[50px] cursor-pointer hover:bg-purple-600 hover:text-white justify-between peer-checked:[&>i]:-rotate-90`}
        >
          <span className="flex gap-2 items-center">
            <i className={item.icon}></i>
            <span className={`${sideOpen ? 'inline' : 'inline lg:hidden'}`}>{item.name}</span>
          </span>
          {sideOpen && !isMobile && (
            <i className="fas fa-caret-left transition-transform duration-200"></i>
          )}
        </label>
      )}
      {item?.childern &&
        item.childern.map((child: any, i: number) => (
          <Link
            href={child.path}
            key={i}
            onClick={() => (isMobile ? setSideOpen(true) : setSideOpen(true))}
            className={`hidden dark:text-white ${!sideOpen && isMobile ? 'peer-checked:flex' : sideOpen && !isMobile ? 'peer-checked:flex' : ''} gap-4 ml-9 items-center px-4 h-[50px] hover:bg-purple-600 hover:text-white cursor-pointer`}
          >
            {child.name}
          </Link>
        ))}
    </div>
  )

  return (
    <section>
      <Head title={title ?? ''}>
        <meta name="description" content={props.description} />
        <meta name="keywords" content={props.keywords} />
        <link rel="icon" type="image/png" href={props.logo} />
      </Head>

      {/* Header */}
      <header
        className={`flex z-40 items-center justify-between shadow-sm p-4 fixed top-0 right-0 h-[70px] transition-all
          ${sideOpen ? 'lg:ml-[20%] lg:w-[78%]' : 'lg:ml-[6%] lg:w-[94%]'}
          w-full bg-purple-700 dark:bg-gray-900 text-white`}
      >
        <div className="flex items-center gap-2">
          <button
            className="lg:hidden"
            onClick={() => setSideOpen(!sideOpen)}
            aria-label="Toggle menu"
          >
            <i className="fa-solid fa-bars" />
          </button>
          <h1 className="font-bold">{title ?? 'Super Admin'}</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex gap-3 items-center hover:bg-purple-900 dark:hover:bg-gray-800 p-2 rounded-md"
          >
            <span className="hidden md:block">{userName}</span> <i className="fa-solid fa-user"></i>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded hover:bg-purple-900 dark:hover:bg-gray-800"
          >
            {darkMode ? <i className="fa-solid fa-sun"></i> : <i className="fa-solid fa-moon"></i>}
          </button>
        </div>
      </header>

      {/* Profile Dropdown */}
      <div
        className={`fixed border-gray-300 transition-all duration-200 ease-in-out right-3 ${
          profileOpen ? 'top-[70px]' : '-top-[300px]'
        } flex flex-col bg-white dark:bg-gray-800 z-40 gap-3 p-4 min-w-[180px] w-fit rounded-xl shadow-lg border border-gray-100 dark:border-gray-700`}
      >
        <div className="flex flex-col items-center">
          <i className="fa-solid fa-user text-purple-600 text-2xl mb-2" />
          <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{userName}</span>
          <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[10px] mt-1">
            {userRole}
          </span>
        </div>
        <div className="h-px bg-gray-200 dark:bg-gray-700" />
        <Link
          onClick={() => setProfileOpen(false)}
          href="/SuperAdmin/account"
          className="text-center py-2 text-sm rounded-lg border border-purple-300 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
        >
          Profile
        </Link>
        <button
          onClick={() => {
            setProfileOpen(false)
            router.delete('/logout')
          }}
          className="text-center py-2 text-sm rounded-lg border border-red-300 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition"
        >
          Logout
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`w-[80%] fixed top-0 ${sideOpen ? '-left-[80%] lg:w-[22%]' : 'left-0 lg:w-[6%]'} lg:left-0 h-[100vh] bg-purple-900 dark:bg-gray-900 text-white shadow-sm transition-all z-40 duration-200 ease-in-out`}
      >
        <div className="h-[70px] border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src={props.logo ?? '/public/images/logo.png'}
              alt="logo"
              className="w-[30px] h-auto"
            />
            <h1 className={`${sideOpen ? 'inline' : 'hidden'} font-bold dark:text-white`}>
              {props.website_name}
            </h1>
          </div>
          {sideOpen && (
            <button
              className="hover:bg-purple-700 dark:text-white p-2 rounded"
              onClick={() => setSideOpen(!sideOpen)}
            >
              <i className="fa-solid fa-angle-left"></i>
            </button>
          )}
        </div>
        <div className="mt-5 h-[calc(100vh-95px)] overflow-auto scrollbar-thin scrollbar-thumb-purple">
          {SideItemData.map(renderMenuItem)}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`p-4 dark:bg-gray-800 bg-gray-50 transition-all duration-200 ease-in-out mt-[70px] min-h-[calc(100vh-70px)]
          ${sideOpen ? 'lg:ml-[20%] lg:w-[80%]' : 'lg:ml-[6%] lg:w-[94%]'}`}
      >
        <div className="ml-5">
          <Breadcrumb />
        </div>
        {children}
      </main>
    </section>
  )
}
