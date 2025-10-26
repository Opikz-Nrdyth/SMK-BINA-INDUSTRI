import React, { useState, useEffect, useRef } from 'react'
import { Head, router } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function Teachers({
  pegawai = [],
  semuaFilter = [],
  search = '',
  filter = '',
}: any) {
  const [searchTerm, setSearchTerm] = useState(search ?? '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null)
  const [filtersState, setFiltersState] = useState<string[]>([])
  const lastRequested = useRef<string | null>(null)

  useEffect(() => {
    AOS.init({ duration: 800, once: false, mirror: true })
  }, [])

  useEffect(() => {
    const key = JSON.stringify({ s: search ?? '', f: filter ?? '' })
    setSearchTerm(search ?? '')
    lastRequested.current = key
  }, [search, filter])

  const normalize = (s: string | undefined | null) => (s ?? '').toString().toLowerCase().trim()

  useEffect(() => {
    const unique = Array.from(new Set(semuaFilter ?? []))

    if (filter && !unique.some((f) => normalize(f) === normalize(filter))) {
      unique.unshift(filter)
    }
    setFiltersState(['All', ...unique])
  }, [semuaFilter, filter])

  useEffect(() => {
    const key = JSON.stringify({ s: (searchTerm ?? '').trim(), f: (filter ?? '').trim() })

    if (!searchTerm || searchTerm.trim() === '') {
      return
    }

    if (lastRequested.current === key) return

    const t = setTimeout(() => {
      lastRequested.current = key // catat request yang akan dikirim
      router.get(
        '/guru-staf',
        { search: searchTerm.trim(), filter: filter ?? '' },
        { preserveScroll: true, replace: true, preserveState: true }
      )
    }, 400)

    return () => clearTimeout(t)
  }, [searchTerm, filter])

  const handleFilter = (f: string) => {
    const sendValue = f === 'All' ? '' : f
    // make sure UI keeps the clicked filter immediately (avoid flicker)
    setFiltersState((prev) =>
      prev.some((x) => normalize(x) === normalize(f)) ? prev : [f, ...prev]
    )
    router.get(
      '/guru-staf',
      { search: searchTerm, filter: sendValue },
      { preserveScroll: true, replace: true }
    )
  }

  const openModal = (person: any) => {
    setSelectedTeacher(person)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedTeacher(null)
  }

  // display helpers
  const isActiveFilter = (f: string) => {
    if (f === 'All') return !filter || filter === '' || normalize(filter) === 'all'
    return filter && normalize(filter) === normalize(f)
  }

  // fallback safe values for person fields
  const getPhoto = (p: any) =>
    p?.fileFoto ??
    `https://ui-avatars.com/api/?name=${p?.fullName?.replaceAll(' ', '-') ?? ''}&background=7e22ce&color=fff`
  const getName = (p: any) => p?.fullName ?? p?.name ?? 'Nama tidak tersedia'
  const getRole = (p: any) => p?.role ?? (p?.jabatan?.startsWith('Staf') ? 'Staf' : 'Guru')

  return (
    <>
      <Head title="Guru & Staf" />

      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-aos="fade-up">
            Guru & Staf
          </h1>
          <p className="text-lg opacity-90" data-aos="fade-up" data-aos-delay="200">
            Kenali para pendidik dan staf profesional kami
          </p>
        </div>
      </section>

      {/* Filter + Search */}
      <section className="py-12 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 mb-8">
            {/* Search */}
            <div className="relative w-full md:w-80" data-aos="fade-right">
              <input
                type="text"
                placeholder="Cari nama atau jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
              <svg
                className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Filter Buttons (preserve animations & group) */}
            <div className="flex flex-wrap gap-2 justify-center" data-aos="fade-left">
              {filtersState.map((f: string, i: number) => (
                <button
                  key={f + i}
                  onClick={() => handleFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    isActiveFilter(f)
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {f === 'All' ? 'Semua' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="text-center mb-8" data-aos="fade-up">
            <p className="text-gray-600 dark:text-gray-400">
              Menampilkan {pegawai?.length ?? 0} hasil
            </p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(pegawai ?? []).map((person: any, index: number) => {
              const name = getName(person)
              const photo = getPhoto(person)
              const role = getRole(person)
              // For guru: show semuaMapelAmpu array; for staf show jabatan
              const subjects: string[] =
                person?.semuaMapelAmpu ?? (person?.mapelPertama ? [person?.mapelPertama] : [])
              const subtitle =
                role === 'Guru'
                  ? subjects.length > 0
                    ? subjects.join(', ')
                    : 'Guru'
                  : (person?.jabatan ?? 'Staf')

              return (
                <div
                  key={person.id ?? index}
                  className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg overflow-hidden group cursor-pointer transform transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl"
                  onClick={() => openModal(person)}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={photo}
                      alt={name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium truncate max-w-[140px] block">
                        {person?.jabatan ??
                          (role === 'Guru'
                            ? subjects[0]
                              ? `Guru ${subjects[0]}`
                              : 'Guru'
                            : 'Staf')}
                            
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors">
                      {name}
                    </h3>
                    {/* <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {subtitle}
                    </p> */}

                    {/* Hover actions (kept from design) */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {(person?.expertise ?? []).slice(0, 2).map((skill: string, i: number) => (
                            <span
                              key={i}
                              className="bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-center text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {pegawai?.length === 0 && (
            <div className="text-center py-12" data-aos="fade-up">
              <p className="text-gray-600 dark:text-gray-400">Tidak ada hasil ditemukan</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            data-aos="zoom-in"
          >
            <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600">
              <img
                src={getPhoto(selectedTeacher)}
                alt={getName(selectedTeacher)}
                className="absolute -bottom-8 left-8 w-24 h-24 rounded-full border-4 border-white object-cover"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-8 pt-12">
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                {getName(selectedTeacher)}
              </h2>
              <p className="text-purple-600 dark:text-purple-400 mb-2">
                {selectedTeacher.jabatan ?? selectedTeacher.role ?? ''}
              </p>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {(selectedTeacher.semuaMapelAmpu ?? selectedTeacher.semuaMapel ?? []).length > 0
                  ? (selectedTeacher.semuaMapelAmpu ?? selectedTeacher.semuaMapel).join(', ')
                  : 'Informasi mapel tidak tersedia.'}
              </p>

              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Tentang</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {selectedTeacher.bio ?? 'Tidak ada deskripsi tersedia.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

Teachers.layout = (page: any) => <GuestLayout>{page}</GuestLayout>
