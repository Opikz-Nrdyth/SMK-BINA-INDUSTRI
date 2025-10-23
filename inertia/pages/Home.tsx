import { useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import SplitText from '~/Components/SplitText'
import GuestLayout from '~/Layouts/GuestLayouts'
import { timeFormat } from '~/Components/FormatWaktu'

// Komponen utama untuk halaman beranda
export default function Home({ dataWebsite, ads }: any) {
  const [darkMode, setDarkMode] = useState(false)

  const [showPopup, setShowPopup] = useState(false)
  const [showClose, setShowClose] = useState(false)

  useEffect(() => {
    // Check for dark mode preference
    const themeFromStorage = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (themeFromStorage) {
      setDarkMode(themeFromStorage === 'dark')
    } else {
      setDarkMode(prefersDark)
    }

    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowPopup(true)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowClose(true)
    }, 3000)
    return () => clearTimeout(timeout)
  }, [])

  const Fasilitas =
    typeof dataWebsite?.fasilitas == 'string'
      ? JSON.parse(dataWebsite.fasilitas)
      : dataWebsite.fasilitas

  return (
    <>
      {ads
        .filter((item: any) => item.tipe == 'popup')
        .map((item: any, index: any) =>
          index == 0 && showPopup ? (
            <div
              key={index}
              className="flex items-center justify-center fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
            >
              {showClose && (
                <button
                  onClick={() => {
                    setShowPopup(false)
                  }}
                  className="bg-red-600 w-[30px] h-[30px] flex justify-center items-center rounded-full absolute top-0 right-0 text-white"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
              <a href={item.tautan} target="__blank">
                <img
                  className="w-[500px] rounded-md"
                  src={
                    item?.gambar
                      ? `/storage/ads/${item?.gambar}`
                      : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item.judul}
                />
              </a>
            </div>
          ) : null
        )}
      {/* BAGIAN: Hero */}
      <section className="relative h-[calc(100vh-50px)] w-full flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0 dark:bg-black/70 bg-black/40 z-10"></div>
        <img
          src={dataWebsite?.hero_background_image ?? 'https://placehold.co/400x400?text=No+Image'}
          alt="Gedung Sekolah"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 text-center px-4 bg-black/10 dark:bg-black/30 w-full h-full flex justify-center items-center flex-col">
          <h1
            data-aos="fade-left"
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-wider"
          >
            {dataWebsite?.hero_title ?? 'Selamat Datang'}
          </h1>
          <div>
            <SplitText
              text={dataWebsite?.hero_subtitle ?? 'Di Sekolah Kami'}
              className="text-3xl md:text-5xl lg:text-6xl font-bold mt-2"
              delay={100}
              duration={0.6}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
            />
          </div>
          <button
            onClick={() => {
              document.getElementById('sambutan')?.scrollIntoView({
                behavior: 'smooth',
              })
            }}
            className="mt-8 inline-block bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            {dataWebsite?.hero_button_text ?? 'Jelajahi'}
          </button>
        </div>
      </section>

      {/* BAGIAN: Sambutan Kepala Sekolah */}
      <section
        id="sambutan"
        className="py-20 bg-white dark:bg-gray-900 w-full overflow-hidden transition-colors duration-300"
      >
        <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="relative flex justify-center items-center">
            <div data-aos="fade-right" className="relative">
              <img
                src={dataWebsite?.headmaster_photo ?? 'https://placehold.co/400x400?text=No+Image'}
                alt={dataWebsite?.headmaster_name}
                className="rounded-full object-top w-64 h-64 md:w-80 md:h-80 object-cover shadow-2xl border-4 border-white dark:border-gray-800"
              />
              <div className="absolute -bottom-8 -right-4 md:right-8 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg">
                <div className="w-16 h-16 bg-[#4D2C7A] dark:bg-purple-700 rounded-full flex items-center justify-center text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div data-aos="fade-left">
            <h2 className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-2 transition-colors duration-300">
              Sambutan Kepala Sekolah
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
              {dataWebsite?.headmaster_name}
            </p>
            <p
              className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify transition-colors duration-300"
              dangerouslySetInnerHTML={{ __html: dataWebsite?.headmaster_welcome_message }}
            ></p>
          </div>
        </div>
      </section>
      {ads
        .filter((item: any) => item.tipe == 'banner')
        .map(
          (item: any, index: any) =>
            index == 0 && (
              <a
                key={index}
                href={item.tautan}
                target="__blank"
                className="flex items-center justify-center"
              >
                <img
                  className="w-[500px]"
                  src={
                    item?.gambar
                      ? `/storage/ads/${item?.gambar}`
                      : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item.judul}
                />
              </a>
            )
        )}
      {/* BAGIAN: Prestasi */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 bg-dot-pattern transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2
            data-aos="fade-up"
            className="text-3xl mb-5 font-bold text-center text-[#4D2C7A] dark:text-purple-400 transition-colors duration-300"
          >
            Prestasi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(dataWebsite ?? []).aktivitas.map((item: any, index: any) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden group transform transition-all duration-300 hover:-translate-y-2"
              >
                <div className="overflow-hidden h-64">
                  <img
                    src={
                      item?.dokumentasi
                        ? `/storage/aktivitas/${item?.dokumentasi}`
                        : 'https://placehold.co/400x400?text=No+Image'
                    }
                    alt={item?.nama}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white transition-colors duration-300">
                    {item?.nama}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm transition-colors duration-300">
                    {item?.deskripsi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ads
        .filter((item: any) => item.tipe == 'banner')
        .map(
          (item: any, index: any) =>
            index == 1 && (
              <a
                key={index}
                href={item.tautan}
                target="__blank"
                className="flex items-center justify-center"
              >
                <img
                  className="w-[500px]"
                  src={
                    item?.gambar
                      ? `/storage/ads/${item?.gambar}`
                      : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item.judul}
                />
              </a>
            )
        )}

      {/* BAGIAN: Berita Terkini */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2
            data-aos="fade-up"
            className="text-3xl mb-5 font-bold text-center text-[#4D2C7A] dark:text-purple-400 transition-colors duration-300"
          >
            Berita Terkini
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(dataWebsite?.news ?? []).map((item: any, index: any) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden group transition-all duration-300"
              >
                <img
                  src={
                    item?.thumbnail
                      ? `/storage/blogs/${item?.thumbnail}`
                      : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item?.judul}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 transition-colors duration-300">
                    {timeFormat(item?.createdAt, { mode: 'date', withDay: true })}
                  </p>
                  <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white hover:text-pink-600 dark:hover:text-pink-400 transition-colors duration-300">
                    <Link href={`/blog/${item?.slug}`}>{item?.judul}</Link>
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 transition-colors duration-300">
                    {item?.ringkasan.split(' ').slice(0, 30).join(' ') +
                      (item?.ringkasan.split(' ')?.length > 30 ? '...' : '')}
                  </p>
                  <Link
                    href={`/blog/${item?.slug}`}
                    className="font-semibold text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 text-sm transition-colors duration-300"
                  >
                    Baca Selengkapnya →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ads
        .filter((item: any) => item.tipe == 'banner')
        .map(
          (item: any, index: any) =>
            index == 2 && (
              <a
                key={index}
                href={item.tautan}
                target="__blank"
                className="flex items-center justify-center"
              >
                <img
                  className="w-[500px]"
                  src={
                    item?.gambar
                      ? `/storage/ads/${item?.gambar}`
                      : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item.judul}
                />
              </a>
            )
        )}

      {/* BAGIAN: Fasilitas */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 bg-dot-pattern transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2
            data-aos="fade-up"
            className="text-3xl mb-5 font-bold text-center text-[#4D2C7A] dark:text-purple-400 transition-colors duration-300"
          >
            Fasilitas Sekolah
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(Fasilitas ?? []).map((item: any, index: any) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                className="relative rounded-lg shadow-lg overflow-hidden group h-60 transition-all duration-300"
              >
                <img
                  src={
                    item?.thumbnail ? item?.thumbnail : 'https://placehold.co/400x400?text=No+Image'
                  }
                  alt={item?.nama}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-xl">{item?.nama}</h3>
                  <p className="text-gray-300 text-sm">{item?.deskripsi}</p>
                  <button className="absolute top-4 right-4 bg-pink-600 h-10 w-10 rounded-full text-white flex items-center justify-center transform translate-x-16 group-hover:translate-x-0 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAGIAN: Guru dan Staf */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <h2
            data-aos="fade-up"
            className="text-3xl mb-5 font-bold text-center text-[#4D2C7A] dark:text-purple-400 transition-colors duration-300"
          >
            Guru dan Staf
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
            {(dataWebsite?.pegawai ?? []).map((item: any, index: any) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="text-center group"
              >
                <div className="relative inline-block">
                  <img
                    src={
                      item?.fileFoto ??
                      `https://ui-avatars.com/api/?name=${item?.fullName?.replaceAll(' ', '-') ?? ''}&background=7e22ce&color=fff`
                    }
                    alt={item?.fullName}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover mx-auto shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-pink-500 transition-all duration-300 transform scale-105 group-hover:scale-110"></div>
                </div>
                <h3 className="font-bold mt-4 text-gray-800 dark:text-white transition-colors duration-300">
                  {item?.fullName}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">
                  {item?.jabatan}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

Home.layout = (page: any) => {
  return <GuestLayout>{page}</GuestLayout>
}
