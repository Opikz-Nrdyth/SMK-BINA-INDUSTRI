import { Head, Link, router, usePage } from '@inertiajs/react'
import { ReactNode, useEffect, useState } from 'react'
import { useNotification } from '~/Components/NotificationAlert'

interface SiswaLayout {
  title?: string
  children: ReactNode
  sideHide?: boolean
}

interface Auth {
  id: string
  fullName: string
  role: string
  email: string
}

export default function SiswaLayout({ title, children, sideHide = false }: SiswaLayout) {
  const [profileOpen, setProfileOpen] = useState(false)
  const { props } = usePage() as any
  const { notify } = useNotification()

  function logout() {
    setProfileOpen(false)
    router.delete('/logout')
  }

  useEffect(() => {
    if (props.session) {
      const session = props.session as any

      if (session.status == 'success') {
        notify(session.message, 'success')
      }

      if (session.status == 'error') {
        notify(session.message, 'error')
      }
    }
  }, [props])

  const menus = [
    {
      name: 'Dashboard',
      path: '/siswa',
      icon: <i className="fa-solid fa-gauge-high"></i>,
    },
    {
      name: 'Absensi',
      path: '/siswa/absensi',
      icon: <i className="fa-solid fa-calendar"></i>,
    },
    {
      name: 'Jadwal Ujian',
      path: '/siswa/jadwalujian',
      icon: <i className="fa-solid fa-hourglass-start"></i>,
    },
  ]

  if (props.lihatNilai) {
    menus.push({
      name: 'Riwayat & Hasil',
      path: '/siswa/riwayatujian',
      icon: <i className="fa-solid fa-file-invoice"></i>,
    })
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Head title={title ?? ''}>
        <meta name="description" content={props.description ?? ''} />
        <meta name="keywords" content={props.keywords} />
        <link rel="icon" type="image/png" href={props.logo} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <header
        className={`fixed bg-white shadow-sm no-print ${sideHide ? 'w-full lg:w-[calc(95%-20px)]' : 'w-full lg:w-[calc(80%-20px)]'} transition-all duration-150 ease-in-out right-0 h-[50px] items-center z-20 flex justify-between lg:justify-end px-5`}
      >
        <div className="flex items-center gap-2 lg:hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKdxSRldcbhDvReReCqMEPE8xt2EijwbuTiw&s"
            alt="logo"
            className="w-[30px] h-auto"
          />
          <h1 className={`inline font-bold dark:text-white`}>{props.website_name}</h1>
        </div>
        <div>
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setProfileOpen(!profileOpen)
            }}
          >
            <div>
              <p className="font-bold">{}</p>
              <p className="text-xs font-light text-gray-500 hidden md:block">
                {(props.user as any).fullName ?? ''}
              </p>
              <p className="text-xs font-light text-gray-500 md:hidden">
                {(props.user as any).fullName.split(' ')[0] ?? ''}
              </p>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${(props.user as any).fullName.replaceAll(' ', '-') ?? ''}&background=7e22ce&color=fff`}
              alt="name-placeholder"
              className="rounded-full w-[35px]"
            />
          </div>
          <div
            className={`fixed transition-all duration-200 shadow-md ease-in-out right-3 ${profileOpen ? 'top-[50px]' : '-top-[300px]'} flex flex-col bg-white z-10 gap-3 p-4 min-w-[180px] w-fit rounded-xl shadow-lg border border-gray-100`}
          >
            <div className="flex flex-col items-center">
              <i className="fa-solid fa-user text-purple-600 text-2xl mb-2" />
              <span className="font-semibold text-gray-800 text-sm">
                {(props.user as any).fullName ?? ''}
              </span>
              <span className="bg-orange-500 text-white px-2.5 py-0.5 rounded-full text-[10px] mt-1">
                Siswa
              </span>
            </div>

            <div className="h-px bg-gray-200" />

            <Link
              onClick={() => setProfileOpen(false)}
              href="/siswa/account"
              className="text-center py-2 text-sm rounded-lg border border-purple-300 text-purple-700
                       hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
            >
              Profile
            </Link>
            <Link
              onClick={() => setProfileOpen(false)}
              href="/siswa/tagihan"
              className="text-center py-2 text-sm rounded-lg border border-purple-300 text-purple-700
                       hover:bg-purple-600 hover:text-white hover:border-purple-600 transition"
            >
              Tagihan & Invoice
            </Link>
            <button
              onClick={logout}
              className="text-center py-2 text-sm rounded-lg border border-red-300 text-red-700
                       hover:bg-red-600 hover:text-white hover:border-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      {/* Sidebar - Desktop */}
      <aside
        className={`no-print hidden lg:flex fixed top-[2.5vh] left-[20px] rounded-lg shadow-md ${sideHide ? 'w-[5%] hover:w-[20%] group opacity-0 h-fit z-40' : 'w-[20%] h-[95vh]'} flex-col bg-gradient-to-b from-purple-600 to-purple-700 text-white p-5 z-20 transition-all duration-150 ease-in-out`}
      >
        <div className="h-[70px] border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img
              src={props.school_logos ?? '/public/images/logo.png'}
              alt="logo"
              className="w-[30px] h-auto"
            />
            <h1 className={`inline font-bold dark:text-white`}>{props.website_name}</h1>
          </div>
        </div>
        {!sideHide ? <div className="text-xl font-bold my-6">Student Portal</div> : null}
        <nav className="flex flex-col gap-3">
          {menus.map((menu, m) => (
            <Link
              title={menu.name}
              href={menu.path}
              key={m}
              className={`flex items-center gap-3 ${sideHide ? 'px-1 group-hover:px-3' : 'px-3'} py-2 rounded-lg hover:bg-purple-500 transition`}
            >
              {menu.icon}
              <span className={`${sideHide ? 'hidden group-hover:block' : 'block'}`}>
                {menu.name}
              </span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 h-[calc(100vh-50px)] overflow-y-auto p-1 lg:${sideHide ? 'ml-[calc(5%+20px)]' : 'ml-[calc(20%+20px)]'} mt-[50px] transition-all duration-200 ease-in-out`}
      >
        {children}
      </main>

      {/* Bottom Nav - Mobile */}
      {!sideHide && (
        <nav className="no-print lg:hidden fixed bottom-0 left-0 w-full rounded-md bg-purple-600 border-t flex justify-around items-center h-[50px] shadow-md">
          {menus.map((menu) => (
            <Link
              href={menu.path}
              key={menu.name}
              className="flex flex-col items-center text-sm h-full justify-center w-full hover:bg-purple-500 text-gray-100"
            >
              {menu.icon}
              <span className="text-xs whitespace-nowrap">{menu.name}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
