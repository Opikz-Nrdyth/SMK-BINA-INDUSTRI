import React from 'react'
import { Head, usePage } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'

export default function SchoolProfile({ dataWebsite }: any) {
  const misi = typeof dataWebsite.misi == 'string' ? JSON.parse(dataWebsite.misi) : dataWebsite.misi
  const { props } = usePage() as any


  return (
    <>
      <Head title="Profil Sekolah" />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Profil Sekolah</h1>
            <p className="text-xl opacity-90">Mengenal Lebih Dekat {dataWebsite?.school_name}</p>
          </div>
        </div>
      </section>

      {/* Sejarah Sekolah */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-4">
                Sejarah Sekolah
              </h2>
              <div className="w-20 h-1 bg-pink-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <img
                  src={
                    dataWebsite?.hero_background_image ??
                    'https://placehold.co/400x400?text=No+Image'
                  }
                  alt="Gedung Sekolah"
                  className="rounded-lg shadow-lg w-full h-64 object-cover"
                />
              </div>
              <div className="space-y-4">
                <p
                  className="text-gray-600 dark:text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: dataWebsite.school_description }}
                ></p>
              </div>
            </div>

            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-2">
                  {dataWebsite?.tahun_berdiri}
                </div>
                <p className="text-gray-600 dark:text-gray-300">Tahun Berdiri</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-2">
                  {dataWebsite?.tahun_pengalaman}+
                </div>
                <p className="text-gray-600 dark:text-gray-300">Tahun Pengalaman</p>
              </div>
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-2">
                  {dataWebsite?.alumni}+
                </div>
                <p className="text-gray-600 dark:text-gray-300">Alumni</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visi dan Misi */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-4">
                Visi & Misi Sekolah
              </h2>
              <div className="w-20 h-1 bg-pink-600 mx-auto"></div>
            </div>

            {/* Visi */}
            <div className="mb-12">
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-[#4D2C7A] dark:bg-purple-600 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Visi</h3>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{dataWebsite?.visi}"
                </p>
              </div>
            </div>

            {/* Misi */}
            <div>
              <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center mr-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Misi</h3>
                </div>
                <div className="space-y-4">
                  {(misi ?? []).map((m: any, i: any) => (
                    <div key={i + 1} className="flex items-start">
                      <div className="w-6 h-6 bg-[#4D2C7A] dark:bg-purple-600 rounded-full flex items-center justify-center mt-1 mr-4 flex-shrink-0">
                        <span className="text-white text-sm font-bold">{i + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tujuan Sekolah */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4D2C7A] dark:text-purple-400 mb-4">
                Tujuan Sekolah
              </h2>
              <div className="w-20 h-1 bg-pink-600 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-[#4D2C7A] dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 14l9-5-9-5-9 5 9 5zm0 0l9 5m-9-5v10"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                  Akademik Unggul
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Mencapai nilai akademik yang tinggi dan kompetitif
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                  Karakter Mulia
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Membentuk siswa berakhlak dan berkarakter baik
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
                <div className="w-16 h-16 bg-[#4D2C7A] dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
                  Berwawasan Global
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Mempersiapkan siswa untuk bersaing di era globalisasi
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

SchoolProfile.layout = (page: any) => {
  return <GuestLayout>{page}</GuestLayout>
}
