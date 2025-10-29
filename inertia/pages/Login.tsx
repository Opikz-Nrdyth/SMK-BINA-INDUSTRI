import { Head, router, usePage } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import { useNotification } from '~/Components/NotificationAlert'

export default function Login({ register, session }: any) {
  const [showPassword, setShowPassword] = useState(false)
  const [values, setValues] = useState({ fullName: '', email: '', password: '', role: '' })

  function submit(e: React.FormEvent) {
    e.preventDefault()
    register
      ? router.post('/register', values, {
          onSuccess: () => {
            window.location.reload()
          },
        })
      : router.post('/login', values)
  }
  const { props } = usePage() as any

  const { notify } = useNotification()

  useEffect(() => {
    if(session && session?.status){
      notify(session?.message, session?.status)
    }
  }, [session])
  
  return (
    <section className="relative h-screen">
      <Head title="Login">
        <meta name="description" content={props.description} />
        <meta name="keywords" content={props.keywords} />
        <link rel="icon" type="image/png" href={props.logo} />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </Head>
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10">
        <div className="w-full h-full bg-black/50 absolute left-0 right-0"></div>
        <div
          className="w-full h-full bg-repeat bg-cover"
          style={{
            backgroundImage: `url('${props.hero_background}')`,
          }}
        ></div>

        <div
          className="absolute -top-28 -left-28 w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full 
                 bg-gradient-to-br from-purple-300/30 via-purple-600/40 to-purple-800/40
                 shadow-2xl flex justify-center items-center px-32"
        >
          <div className="text-center ml-10 hidden lg:block">
            <h1 className="font-extrabold text-white text-4xl">WELCOME</h1>
            <p className="text-white mt-3l" dangerouslySetInnerHTML={{__html:props.login}}></p>
          </div>
        </div>
        <div
          className="absolute -bottom-36 -left-36 w-[400px] h-[400px] md:w-[300px] md:h-[300px] lg:w-[400px] lg:h-[400px] rounded-full 
                 bg-gradient-to-tl from-pink-300/30 via-pink-600/60 to-pink-800 
                 shadow-2xl"
        ></div>
        <div
          className="absolute top-1/2 md:top-2/3 lg:top-1/2 left-80 md:left-[85%] lg:left-80 w-[220px] h-[220px] rounded-full 
                 bg-gradient-to-br from-orange-300/50 via-orange-600/80 to-orange-800 
                 shadow-2xl"
        ></div>
        <div
          className="absolute hidden lg:block -bottom-10 -right-10 md:-right-10 w-[180px] h-[180px] rounded-full 
                 bg-gradient-to-br from-purple-300/30 via-purple-600/30 to-blue-800/30 
                 shadow-2xl"
        ></div>
      </div>

      <form
        onSubmit={submit}
        className="absolute flex justify-center px-2 md:px-0 py-4 h-fit items-center right-0 lg:-right-72 top-1/2 -translate-y-1/2 lg:-translate-x-1/4 w-[95%] mr-[2.5%] md:w-[60%] md:mr-[20%] lg:ml-0 lg:w-[600px]  bg-white/30 backdrop-blur-sm rounded-lg border border-white"
      >
        <div>
          <div className="w-full flex flex-col -mt-3 mb-4 justify-center items-center">
            <img src={props.logo} className="w-[75px]" alt="logo" />
            <h1 className="font-extrabold text-white text-2xl">{props.website_name}</h1>
          </div>

          <p className="text-white mb-4 ml-2">
            {register
              ? 'Daftar untuk Super Admin pertama'
              : 'Masukan email dan password pendaftaran anda'}
          </p>
          <div className="">
            {register && (
              <div className="relative mb-6 group">
                <div className="text-gray-300 group-focus-within:text-gray-600 absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                  <i className="fa-solid fa-user"></i>
                </div>
                <input
                  type="fullName"
                  value={values.fullName}
                  onChange={(e) => {
                    setValues((props) => ({
                      ...props,
                      fullName: e.target.value,
                    }))
                  }}
                  autoFocus
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg group-focus-within:ring-blue-500 group-focus-within:border-blue-500 block w-full ps-10 p-2.5"
                  placeholder="Nama Lengkap"
                />
              </div>
            )}
            <div className="relative mb-6 group">
              <div className="text-gray-300 group-focus-within:text-gray-600 absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <i className="fa-solid fa-envelope"></i>
              </div>
              <input
                type="email"
                value={values.email}
                onChange={(e) => {
                  setValues((props) => ({
                    ...props,
                    email: e.target.value,
                  }))
                }}
                autoFocus={!register}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg group-focus-within:ring-blue-500 group-focus-within:border-blue-500 block w-full ps-10 p-2.5"
                placeholder="name@gmail.com"
              />
            </div>
            <div className="relative mb-2 group">
              <div className="text-gray-300 group-focus-within:text-gray-600 absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
                <i className="fa-solid fa-key"></i>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={values.password}
                onChange={(e) => {
                  setValues((props) => ({
                    ...props,
                    password: e.target.value,
                  }))
                }}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg group-focus-within:ring-blue-500 group-focus-within:border-blue-500 block w-full ps-10 p-2.5"
                placeholder="Password Anda"
              />
            </div>
            <div className="flex items-center mb-4 ml-2">
              <input
                id="default-checkbox"
                type="checkbox"
                checked={showPassword}
                onChange={() => {
                  setShowPassword(!showPassword)
                }}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 rounded-mb"
              />
              <label htmlFor="default-checkbox" className="ms-2 text-sm font-medium text-gray-100 ">
                Lihat Password
              </label>
            </div>

            <button className="bg-purple-600 hover:bg-purple-800 w-full py-2 text-center text-white rounded-md">
              {register ? 'REGISTER' : 'LOGIN'}
            </button>
          </div>
        </div>
      </form>

      {session.roleInput && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="bg-white/20 border border-white/30 backdrop-blur-md shadow-xl rounded-xl p-8 w-[90%] max-w-md text-center">
            <h2 className="text-2xl font-bold text-white mb-6">Pilih Role Login</h2>
            <p className="text-gray-200 mb-8">
              Anda terdaftar sebagai <b>Guru</b> dan <b>Staf</b>. Silakan pilih peran untuk masuk ke
              dashboard yang sesuai.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  const payload = {
                    ...values,
                    role: 'Guru',
                  }
                  router.post('/login', payload)
                }}
                className="w-full sm:w-1/2 py-3 rounded-md bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold hover:from-purple-600 hover:to-purple-800 transition"
              >
                Masuk sebagai Guru
              </button>

              <button
                onClick={() => {
                  const payload = {
                    ...values,
                    role: 'Staf',
                  }
                  router.post('/login', payload)
                }}
                className="w-full sm:w-1/2 py-3 rounded-md bg-gradient-to-r from-pink-500 to-pink-700 text-white font-semibold hover:from-pink-600 hover:to-pink-800 transition"
              >
                Masuk sebagai Staf
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
