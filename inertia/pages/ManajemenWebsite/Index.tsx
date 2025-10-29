import React, { useState, useEffect } from 'react'
import { useForm, usePage } from '@inertiajs/react'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import UniversalInput from '~/Components/UniversalInput'
import SplitText from '~/Components/SplitText'
import AOS from 'aos'
import { useNotification } from '~/Components/NotificationAlert'

interface WebsiteSettings {
  // Informasi Sekolah
  school_name: string
  school_description: string
  school_address: string
  school_phone: string
  school_email: string
  fax: string
  school_logo: string
  tahun_berdiri: string
  tahun_pengalaman: string
  alumni: string
  yayasan: string
  lat: string
  long: string
  text_login:string

  // Sambutan Kepala Sekolah
  headmaster_name: string
  headmaster_title: string
  headmaster_photo: string
  headmaster_welcome_message: string

  // Kontak & Sosial Media
  facebook_url: string
  instagram_url: string
  twitter_url: string
  youtube_url: string

  //profile
  visi: string
  misi: string[]
  fasilitas: any[]

  // Meta & SEO
  website_title: string
  website_description: string
  website_keywords: string

  // Footer
  footer_copyright: string
  footer_developer: string

  // Hero Section
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_button_text: string

  //ujian
  timer_pinalty: string
  pinalty: string

  //setting
  editProfile: string
  lihatNilai: string
  ppdb: string
}

export default function LandingPageManagement() {
  const { props } = usePage<any>()
  const [activeTab, setActiveTab] = useState('general')
  const [previewLogo, setPreviewLogo] = useState('')
  const [previewHeadmasterPhoto, setPreviewHeadmasterPhoto] = useState('')
  const [previewHeroImage, setPreviewHeroImage] = useState('')
  const { notify } = useNotification()

  const { data, setData, post, processing, reset } = useForm<WebsiteSettings>({
    // Informasi Sekolah
    yayasan: '',
    school_name: '',
    school_description: '',
    school_address: '',
    school_phone: '',
    school_email: '',
    fax: '',
    school_logo: '',
    tahun_berdiri: '',
    tahun_pengalaman: '',
    alumni: '',
    lat: '',
    long: '',
    text_login:"",

    // Sambutan Kepala Sekolah
    headmaster_name: '',
    headmaster_title: '',
    headmaster_photo: '',
    headmaster_welcome_message: '',

    // Kontak & Sosial Media
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',

    // Profile
    visi: '',
    misi: [''],
    fasilitas: [],

    // Meta & SEO
    website_title: '',
    website_description: '',
    website_keywords: '',

    // Footer
    footer_copyright: '',
    footer_developer: '',

    // Hero Section
    hero_title: '',
    hero_subtitle: '',
    hero_background_image: '',
    hero_button_text: '',

    //ujian
    timer_pinalty: '',
    pinalty: '',

    //setting
    editProfile: '0',
    lihatNilai: '0',
    ppdb: '0',
  })

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: false,
      mirror: true,
    })
  }, [])

  // Load data dari props jika ada
  useEffect(() => {
    if (props.settings) {
      setData(props.settings)

      // Set preview images
      if (props.settings.school_logo) {
        setPreviewLogo(props.settings.school_logo)
      }
      if (props.settings.headmaster_photo) {
        setPreviewHeadmasterPhoto(props.settings.headmaster_photo)
      }
      if (props.settings.hero_background_image) {
        setPreviewHeroImage(props.settings.hero_background_image)
      }

      if (props.settings.fasilitas) {
        setData((prev) => ({
          ...prev,
          fasilitas:
            typeof props.settings.fasilitas == 'string'
              ? JSON.parse(props.settings.fasilitas)
              : props.settings.fasilitas,
        }))
      }

      if (props.settings.misi) {
        setData((prev) => ({
          ...prev,
          misi:
            typeof props.settings.misi == 'string'
              ? JSON.parse(props.settings.misi)
              : props.settings.misi,
        }))
      }
    }
  }, [props.settings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Konversi array ke JSON string sebelum dikirim
    const payload = {
      ...data,
      misi: JSON.stringify(data?.misi ?? []),
      fasilitas: JSON.stringify(data?.fasilitas ?? []),
    }

    post('/SuperAdmin/landing-page/settings', {
      data: payload,
      preserveScroll: true,
      onSuccess: ({ props }: any) => {
        notify('Berhasil Menyimpan Pengaturan', 'success')
      },
    })
  }

  const handleImageUpload = (field: string, files: File[]) => {
    if (files.length > 0) {
      const file = files[0]
      const reader = new FileReader()

      reader.onload = (e) => {
        const result = e.target?.result as string

        // Update preview
        if (field === 'school_logo') {
          setPreviewLogo(result)
        } else if (field === 'headmaster_photo') {
          setPreviewHeadmasterPhoto(result)
        } else if (field === 'hero_background_image') {
          setPreviewHeroImage(result)
        }

        // Update data dengan base64 string
        setData(field as any, result)
      }

      reader.readAsDataURL(file)
    }
  }

  const tabs = [
    { id: 'general', name: 'Informasi Umum', icon: 'fa-solid fa-building' },
    { id: 'headmaster', name: 'Sambutan Kepala Sekolah', icon: 'fa-solid fa-user-tie' },
    { id: 'profile', name: 'Profil Sekolah', icon: 'fa-solid fa-school' },
    { id: 'hero', name: 'Hero Section', icon: 'fa-solid fa-image' },
    { id: 'social', name: 'Sosial Media', icon: 'fa-solid fa-share-nodes' },
    { id: 'seo', name: 'SEO & Meta', icon: 'fa-solid fa-magnifying-glass' },
    { id: 'ujian', name: 'Ujian', icon: 'fa-solid fa-file-pen' },
    { id: 'setting', name: 'Settings', icon: 'fa-solid fa-gears' },
  ]

  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="text"
                name="yayasan"
                label="Nama Yayasan"
                value={data?.yayasan}
                onChange={(value) => setData('yayasan', value)}
                placeholder="Contoh: Yayasan Pendidikan Nasional"
                required
              />
              <UniversalInput
                type="text"
                name="school_name"
                label="Nama Sekolah"
                value={data?.school_name}
                onChange={(value) => setData('school_name', value)}
                placeholder="Contoh: SMA Negeri 1 Indonesia"
                required
              />
            </div>

            <UniversalInput
              type="richtext"
              name="school_description"
              label="Sejarah sekolah"
              value={data?.school_description}
              onChange={(value) => setData('school_description', value)}
              placeholder="Deskripsi singkat tentang sekolah..."
            />

            <UniversalInput
              type="richtext"
              name="text_login"
              label="Sambutan Login"
              value={data?.text_login}
              onChange={(value) => setData('text_login', value)}
              placeholder="Sambutan Singkat Untuk Halaman Login...."
            />

            <UniversalInput
              type="textarea"
              name="school_address"
              label="Alamat Lengkap"
              value={data?.school_address}
              onChange={(value) => setData('school_address', value)}
              placeholder="Alamat lengkap sekolah..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UniversalInput
                type="number"
                name="tahun_berdiri"
                label="Tahun Berdiri"
                value={data?.tahun_berdiri}
                onChange={(value) => setData('tahun_berdiri', value)}
                placeholder="Contoh: 2025"
              />

              <UniversalInput
                type="number"
                name="tahun_pengalaman"
                label="Tahun Pengalaman"
                value={data?.tahun_pengalaman}
                onChange={(value) => setData('tahun_pengalaman', value)}
                placeholder="Contoh: 50"
              />

              <UniversalInput
                type="number"
                name="alumni"
                label="Total Alumni"
                value={data?.alumni}
                onChange={(value) => setData('alumni', value)}
                placeholder="Contoh: 5000"
              />

              <UniversalInput
                type="tel"
                name="school_phone"
                label="Nomor Telepon"
                value={data?.school_phone}
                onChange={(value) => setData('school_phone', value)}
                placeholder="Contoh: 0823-2803-5237"
              />

              <UniversalInput
                type="email"
                name="school_email"
                label="Email Sekolah"
                value={data?.school_email}
                onChange={(value) => setData('school_email', value)}
                placeholder="Contoh: info@sman1sleman.sch.id"
              />

              <UniversalInput
                type="text"
                name="fax"
                label="Fax"
                value={data?.fax}
                onChange={(value) => setData('fax', value)}
                placeholder="Contoh: info@sman1sleman.sch.id"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <UniversalInput
                  type="file"
                  name="school_logo"
                  label="Logo Sekolah"
                  onChange={(files) => handleImageUpload('school_logo', files)}
                  accept="image/*"
                />
                {previewLogo && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview Logo:</p>
                    <img
                      src={previewLogo}
                      alt="Preview Logo"
                      className="w-32 h-32 object-contain border rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="text"
                name="long"
                label="Alamat Sekolah (Longitude)"
                value={data?.long}
                onChange={(value) => setData('long', value)}
                placeholder="Contoh: -7.882738"
                required
              />
              <UniversalInput
                type="text"
                name="lat"
                label="Alamat Sekolah (Latitude)"
                value={data?.lat}
                onChange={(value) => setData('lat', value)}
                placeholder="Contoh: 112.882738"
                required
              />
            </div>
          </div>
        )

      case 'headmaster':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="text"
                name="headmaster_name"
                label="Nama Kepala Sekolah"
                value={props?.kepalaSekolah?.user?.fullName}
                readonly
                onChange={(value) => setData('headmaster_name', value)}
                placeholder="Buka menu Tahun Ajaran dan pilih kepala sekolah"
                required
              />

              <UniversalInput
                type="text"
                readonly
                name="tahun_ajaran"
                label="Tahun Ajaran"
                value={props?.kepalaSekolah?.tahunAjaran}
                onChange={(value) => setData('headmaster_title', value)}
                placeholder="Contoh: 2023/2024"
              />
            </div>

            <div>
              <UniversalInput
                type="file"
                name="headmaster_photo"
                label="Foto Kepala Sekolah"
                onChange={(files) => handleImageUpload('headmaster_photo', files)}
                accept="image/*"
              />
              {previewHeadmasterPhoto && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview Foto:</p>
                  <img
                    src={previewHeadmasterPhoto}
                    alt="Preview Foto Kepala Sekolah"
                    className="w-48 h-48 object-cover object-top rounded-full border-4 border-white shadow-lg"
                  />
                </div>
              )}
            </div>

            <UniversalInput
              type="richtext"
              name="headmaster_welcome_message"
              label="Pesan Sambutan"
              value={data?.headmaster_welcome_message}
              onChange={(value) => setData('headmaster_welcome_message', value)}
              placeholder="Tuliskan pesan sambutan dari kepala sekolah..."
            />
          </div>
        )

      case 'profile':
        return (
          <div className="space-y-8">
            {/* VISI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Visi Sekolah
              </label>
              <UniversalInput
                name="visi"
                type="textarea"
                value={data?.visi}
                onChange={(e) => setData('visi', e)}
                placeholder="Tuliskan visi sekolah..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
              />
            </div>

            {/* MISI */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Misi Sekolah
              </label>
              <div className="space-y-3">
                {((typeof data?.misi == 'string' ? JSON.parse(data?.misi) : data?.misi) ?? []).map(
                  (item: any, index: any) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => {
                          const updated = [...data?.misi]
                          updated[index] = e.target.value
                          setData('misi', updated)
                        }}
                        placeholder={`Misi ${index + 1}`}
                        className="w-full px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data?.misi.filter((_, i) => i !== index)
                          setData('misi', updated)
                        }}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  )
                )}

                <button
                  type="button"
                  onClick={() => setData('misi', [...(data?.misi ?? []), ''])}
                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <i className="fa-solid fa-plus"></i> Tambah Misi
                </button>
              </div>
            </div>

            {/* FASILITAS */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Fasilitas Sekolah
              </label>

              <div className="space-y-6">
                {(
                  (typeof data?.fasilitas == 'string'
                    ? JSON.parse(data?.fasilitas)
                    : data?.fasilitas) ?? []
                ).map((fasilitas: any, index: number) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Thumbnail
                        </label>
                        <input
                          name="fasilitas"
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            try {
                              const formData = new FormData()
                              formData?.append('file', file)

                              // Upload ke backend
                              const response = await fetch(
                                '/SuperAdmin/landing-page/upload-fasilitas',
                                {
                                  method: 'POST',
                                  headers: {
                                    'X-CSRF-TOKEN': token || '',
                                  },
                                  body: formData,
                                }
                              )

                              const result = await response.json()

                              if (result.success && result.url) {
                                const updated = [...data?.fasilitas]
                                updated[index].thumbnail = result.url // simpan URL dari backend
                                setData('fasilitas', updated)
                              } else {
                                alert('Gagal upload gambar!')
                              }
                            } catch (error) {
                              console.error(error)
                              alert('Terjadi kesalahan saat upload.')
                            }
                          }}
                          className="block w-full mt-1"
                        />

                        {fasilitas.thumbnail && (
                          <img
                            src={fasilitas.thumbnail}
                            alt="Preview"
                            className="mt-2 w-32 h-32 object-cover rounded-lg"
                          />
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-3">
                        <input
                          type="text"
                          value={fasilitas.nama}
                          onChange={(e) => {
                            const updated = [...data?.fasilitas]
                            updated[index].nama = e.target.value
                            setData('fasilitas', updated)
                          }}
                          placeholder="Nama Fasilitas"
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />

                        <textarea
                          value={fasilitas.deskripsi}
                          onChange={(e) => {
                            const updated = [...data?.fasilitas]
                            updated[index].deskripsi = e.target.value
                            setData('fasilitas', updated)
                          }}
                          placeholder="Deskripsi singkat fasilitas..."
                          className="w-full px-3 py-2 rounded-md border bg-white border-gray-300 text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = data?.fasilitas.filter((_, i) => i !== index)
                          setData('fasilitas', updated)
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        <i className="fa-solid fa-trash"></i> Hapus Fasilitas
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setData('fasilitas', [
                      ...(data?.fasilitas || []),
                      { thumbnail: '', nama: '', deskripsi: '', file: null },
                    ])
                  }
                  className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  <i className="fa-solid fa-plus"></i> Tambah Fasilitas
                </button>
              </div>
            </div>
          </div>
        )

      case 'hero':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="text"
                name="hero_title"
                label="Judul Hero Section"
                value={data?.hero_title}
                onChange={(value) => setData('hero_title', value)}
                placeholder="Contoh: Selamat Datang"
              />

              <UniversalInput
                type="text"
                name="hero_subtitle"
                label="Subtitle Hero Section"
                value={data?.hero_subtitle}
                onChange={(value) => setData('hero_subtitle', value)}
                placeholder="Tuliskan subtitle atau deskripsi singkat..."
              />

              <UniversalInput
                type="text"
                name="hero_button_text"
                label="Teks Tombol Hero"
                value={data?.hero_button_text}
                onChange={(value) => setData('hero_button_text', value)}
                placeholder="Contoh: Jelajahi Sekolah Kami"
              />
            </div>

            <div>
              <UniversalInput
                type="file"
                name="hero_background_image"
                label="Gambar Background Hero"
                onChange={(files) => handleImageUpload('hero_background_image', files)}
                accept="image/*"
              />
              {previewHeroImage && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Preview Background:
                  </p>
                  <img
                    src={previewHeroImage}
                    alt="Preview Background Hero"
                    className="w-full max-w-2xl h-64 object-cover rounded-lg border shadow-lg"
                  />
                </div>
              )}
            </div>

            {/* Preview Hero Section */}
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Preview Hero Section
              </h3>
              <div className="relative h-80 w-full flex items-center justify-center text-white overflow-hidden rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
                {previewHeroImage ? (
                  <img
                    src={previewHeroImage}
                    alt="Preview Hero Background"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-500 dark:text-gray-400">No background image</span>
                  </div>
                )}
                <div className="relative z-20 text-center px-4 bg-black/10 dark:bg-black/30 w-full h-full flex justify-center items-center flex-col">
                  <h1
                    data-aos="fade-left"
                    className="text-2xl md:text-6xl lg:text-7xl font-extrabold tracking-wider"
                  >
                    {data?.hero_title || 'Selamat Datang'}
                  </h1>
                  <div>
                    <SplitText
                      text={data?.hero_subtitle || 'Di SMK Bina Industri'}
                      className="text-xl md:text-5xl lg:text-6xl font-bold mt-2"
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

                  {data?.hero_button_text && (
                    <button
                      type="button"
                      className="mt-6 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                      {data?.hero_button_text}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                <p>• Untuk hasil maksimal edit di perangkat desktop atau lebih besar</p>
                <p>• Preview akan menampilkan gambar dan teks yang telah diinput</p>
                <p>• Ukuran hero section: h-80 (20rem)</p>
                <p>• Gambar latar akan ditampilkan jika sudah diupload</p>
              </div>
            </div>
          </div>
        )

      case 'social':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="url"
                name="facebook_url"
                label="URL Facebook"
                value={data?.facebook_url}
                onChange={(value) => setData('facebook_url', value)}
                placeholder="https://facebook.com/sman1sleman"
              />

              <UniversalInput
                type="url"
                name="instagram_url"
                label="URL Instagram"
                value={data?.instagram_url}
                onChange={(value) => setData('instagram_url', value)}
                placeholder="https://instagram.com/sman1sleman"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <UniversalInput
                type="url"
                name="twitter_url"
                label="URL Twitter/X"
                value={data?.twitter_url}
                onChange={(value) => setData('twitter_url', value)}
                placeholder="https://twitter.com/sman1sleman"
              />

              <UniversalInput
                type="url"
                name="youtube_url"
                label="URL YouTube"
                value={data?.youtube_url}
                onChange={(value) => setData('youtube_url', value)}
                placeholder="https://youtube.com/@sman1sleman"
              />
            </div>
          </div>
        )

      case 'seo':
        return (
          <div className="space-y-6">
            <UniversalInput
              type="textarea"
              name="website_description"
              label="Meta Description"
              value={data?.website_description}
              onChange={(value) => setData('website_description', value)}
              placeholder="Deskripsi website untuk SEO (maksimal 160 karakter)..."
            />

            <UniversalInput
              type="textarea"
              name="website_keywords"
              label="Meta Keywords"
              value={data?.website_keywords}
              onChange={(value) => setData('website_keywords', value)}
              placeholder="Kata kunci untuk SEO, dipisahkan dengan koma..."
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                Tips SEO Optimal:
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <li>• Meta description ideal 150-160 karakter</li>
                <li>• Gunakan kata kunci yang relevan dengan sekolah</li>
                <li>• Hindari keyword stuffing (pengulangan berlebihan)</li>
                <li>• Pastikan deskripsi menarik dan informatif</li>
              </ul>
            </div>
          </div>
        )

      case 'ujian':
        return (
          <div className="space-y-6">
            <UniversalInput
              type="number"
              name="timer_pinalty"
              label="Timer Untuk Pinalty"
              value={data?.timer_pinalty}
              onChange={(value) => setData('timer_pinalty', value)}
              placeholder="Ex.10 artinya 10 Detik ..."
            />

            <UniversalInput
              type="number"
              name="pinalty"
              label="Pinalty"
              value={data?.pinalty}
              onChange={(value) => setData('pinalty', value)}
              placeholder="Ex.10 artinya 10 Detik ..."
            />

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
                Panduan Pinalty:
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                <li>• Timer di hitung dalam satuan detik</li>
                <li>• Timer pinalty adalah waktu siswa diperbolehkan keluar ujian</li>
                <li>• Pinalty adalah pengurangan waktu ujian</li>
              </ul>
            </div>
          </div>
        )

      case 'setting':
        return (
          <div className="space-y-6">
            <UniversalInput
              type="switch"
              name="EditProfile"
              label="Edit Profile"
              value={data?.editProfile}
              onChange={(value) => {
                setData('editProfile', value)
              }}
            />
            <UniversalInput
              type="switch"
              name="lihatNilai"
              label="Lihat Nilai"
              value={data?.lihatNilai}
              onChange={(value) => {
                setData('lihatNilai', value)
              }}
            />
            <UniversalInput
              type="switch"
              name="ppdb"
              label="Halaman PPDB"
              value={data?.ppdb}
              onChange={(value) => {
                setData('ppdb', value)
              }}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="mx-auto lg:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Website</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola konten dan pengaturan halaman utama website sekolah
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <i className={tab.icon}></i>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {renderTabContent()}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => reset()}
              disabled={processing}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {processing ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Menyimpan...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save"></i>
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

LandingPageManagement.layout = (page: any) => (
  <SuperAdminLayout title="Manajemen Landing Page">{page}</SuperAdminLayout>
)
