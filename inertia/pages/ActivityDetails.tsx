// resources/js/Pages/ActivityDetail.tsx

import React, { useState, useEffect } from 'react'
import { Head, Link, usePage } from '@inertiajs/react'
import GuestLayout from '~/Layouts/GuestLayouts'
import AOS from 'aos'
import 'aos/dist/aos.css'

interface Activity {
  id: string
  nama: string
  jenis: string
  deskripsi: string
  lokasi: string
  tanggalPelaksanaan: string
  dokumentasi?: string | null
  pembuat: {
    nama: string
  }
}

interface PageProps {
  activity: Activity
}

export default function ActivityDetail() {
  const { activity } = usePage<PageProps>().props
  const [currentImage, setCurrentImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })
  }, [])

  // Generate images untuk detail page
  const getActivityImages = () => {
    if (activity.dokumentasi) {
      return [activity.dokumentasi]
    }
  }

  const activityImages = getActivityImages()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getActivityTypeColor = (jenis: string) => {
    const colors: { [key: string]: string } = {
      ekstrakurikuler: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      studi_tour: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      lomba: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      prestasi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      bakti_sosial: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      upacara: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      lainnya: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    }
    return colors[jenis] || colors.lainnya
  }

  const getActivityTypeLabel = (jenis: string) => {
    const types: { [key: string]: string } = {
      ekstrakurikuler: 'Ekstrakurikuler',
      studi_tour: 'Studi Tour',
      lomba: 'Lomba',
      prestasi: 'Prestasi',
      bakti_sosial: 'Bakti Sosial',
      upacara: 'Upacara',
      lainnya: 'Lainnya',
    }
    return types[jenis] || 'Lainnya'
  }

  const nextImage = () => {
    setCurrentImage((prev) => (prev === activityImages.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? activityImages.length - 1 : prev - 1))
  }

  const openModal = (index: number) => {
    setCurrentImage(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Head title={activity.nama} />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-4">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getActivityTypeColor(activity.jenis)}`}
              >
                {getActivityTypeLabel(activity.jenis)}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" data-aos="fade-up">
              {activity.nama}
            </h1>
            <div
              className="flex flex-wrap justify-center items-center gap-4 text-lg opacity-90"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {activity.lokasi}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(activity.tanggalPelaksanaan)}
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {activity.pembuat?.nama || 'Admin Sekolah'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Content */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Main Image Gallery */}
            <div
              className="mb-12 rounded-2xl overflow-hidden shadow-2xl relative"
              data-aos="fade-up"
            >
              <img
                src={activityImages[currentImage]}
                alt={`${activity.nama} - Foto ${currentImage + 1}`}
                className="w-full h-96 object-cover cursor-pointer"
                onClick={() => openModal(currentImage)}
              />

              {/* Navigation Arrows */}
              {activityImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              {activityImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImage + 1} / {activityImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {activityImages.length > 1 && (
              <div className="mb-12" data-aos="fade-up" data-aos-delay="200">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Galeri Foto
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {activityImages.map((image: string, index: number) => (
                    <div
                      key={index}
                      className={`relative rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 ${
                        currentImage === index ? 'ring-2 ring-purple-500' : ''
                      }`}
                      onClick={() => setCurrentImage(index)}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Description */}
            <article className="prose prose-lg dark:prose-invert max-w-none" data-aos="fade-up">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Deskripsi Kegiatan
              </h2>
              <div className="text-gray-600 dark:text-gray-300 leading-relaxed text-justify">
                {activity?.deskripsi?.split('\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>

            {/* Activity Details */}
            <div className="bg-gray-50 mt-12 dark:bg-gray-800 p-6 rounded-lg" data-aos="fade-up">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Informasi Kegiatan
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Jenis Kegiatan:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {getActivityTypeLabel(activity.jenis)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Lokasi:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {activity.lokasi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tanggal:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {formatDate(activity.tanggalPelaksanaan)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Dibuat Oleh:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {activity.pembuat?.nama || 'Admin Sekolah'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <img
              src={activityImages[currentImage]}
              alt={`${activity.nama} - Foto ${currentImage + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />

            {activityImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {currentImage + 1} / {activityImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Back to Activities List */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <Link
              href="/kegiatan"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-300 font-medium shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Daftar Kegiatan
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

ActivityDetail.layout = (page: any) => {
  return <GuestLayout>{page}</GuestLayout>
}
