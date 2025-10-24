// resources/js/Pages/Siswa/Jawaban/PreviewJawaban.tsx
import { useState, useEffect } from 'react'
import { usePage, router } from '@inertiajs/react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { Notification } from '~/Components/Notification'

interface JawabanItem {
  id: string
  soal: string
  jawaban: string
  type?: 'pilihan_ganda' | 'essay'
  options?: string[]
}

export default function PreviewJawaban({
  jawabanData,
  kehadiran,
}: {
  jawabanData: any
  kehadiran: any
}) {
  const { props } = usePage()
  const [jawaban, setJawaban] = useState<JawabanItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (jawabanData) {
      let formattedJawaban: JawabanItem[] = []

      if (Array.isArray(jawabanData)) {
        formattedJawaban = jawabanData
      } else if (typeof jawabanData === 'object' && jawabanData !== null) {
        formattedJawaban = Object.entries(jawabanData).map(([id, jawaban]) => ({
          id,
          soal: `Soal ${id}`,
          jawaban: jawaban as string,
          type: 'pilihan_ganda',
          options: [],
        }))
      }

      setJawaban(formattedJawaban)
      setLoading(false)
    } else {
      setJawaban([])
      setLoading(false)
    }
  }, [jawabanData])

  const safeJawaban = Array.isArray(jawaban) ? jawaban : []

  if (loading) {
    return (
      <SiswaLayout>
        <div className="max-w-7xl mx-auto lg:p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SiswaLayout>
    )
  }


  return (
    <SiswaLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Notification />

          {/* Action Buttons - Hanya di Screen */}
          <div className="flex justify-between items-center mb-6 no-print">
            <button
              onClick={() => router.visit('/siswa/riwayatujian')}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Kembali ke Daftar Ujian
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Cetak Jawaban
            </button>
          </div>

          {/* Lembar Jawaban - Format Standar Ujian */}
          <div className="bg-white border border-gray-800 shadow-lg print:shadow-none print:border-2">
            {/* Kop Surat */}
            <div className="border-b border-gray-800 py-4 px-8 text-center">
              <div className="text-sm font-bold">PEMERINTAH KABUPATEN</div>
              <div className="text-sm font-bold">DINAS PENDIDIKAN</div>
              <div className="text-sm">UPT DINAS PENDIDIKAN KECAMATAN</div>
              <div className="text-lg font-bold mt-2">LEMBAR JAWABAN SISWA</div>
              <div className="text-sm">TAHUN PELAJARAN 2024/2025</div>
            </div>

            {/* Informasi Ujian */}
            <div className="border-b border-gray-800 py-4 px-8">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="w-1/4 font-bold">MATA PELAJARAN</td>
                    <td className="w-3/4">: {kehadiran?.ujian?.mapel?.namaMataPelajaran || '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">NAMA SISWA</td>
                    <td>: {kehadiran?.user?.fullName || '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">JENIS UJIAN</td>
                    <td>: {kehadiran?.ujian?.jenisUjian || '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">NAMA UJIAN</td>
                    <td>: {kehadiran?.ujian?.namaUjian || '-'}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">TANGGAL UJIAN</td>
                    <td>
                      :{' '}
                      {kehadiran?.createdAt
                        ? new Date(kehadiran.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-bold">SKOR UJIAN</td>
                    <td>: {kehadiran?.skor || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Daftar Jawaban */}
            <div className="py-6 px-8">
              <div className="mb-6 text-center">
                <div className="font-bold text-lg underline">LEMBAR JAWABAN SISWA</div>
              </div>

              <div className="space-y-8">
                {safeJawaban.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="flex items-start gap-3 mb-4">
                      {/* Nomor Soal */}
                      <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-sm font-bold">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>

                      {/* Pertanyaan */}
                      <div className="flex-1">
                        <div className="text-gray-900 mb-4 leading-relaxed text-justify font-medium">
                          {item.soal || `Soal ${item.id}`}
                        </div>

                        {/* Opsi Pilihan */}
                        {item.options && item.options.length > 0 ? (
                          <div className="space-y-2">
                            {item.options.map((option, optIndex) => {
                              const labels = ['A', 'B', 'C', 'D', 'E']
                              const isSelected = item.jawaban === labels[optIndex]
                              return (
                                <div
                                  key={optIndex}
                                  className={`text-sm ${isSelected ? 'text-gray-800 font-bold' : 'text-gray-700'}`}
                                >
                                  <span className="font-bold mr-2">{labels[optIndex]}.</span>
                                  {option}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          /* Untuk soal tanpa opsi (essay) */
                          <div>
                            <div className="text-sm text-gray-600 font-medium mb-2">
                              Jawaban Anda:
                            </div>
                            <div
                              className={`text-gray-900 ${item.jawaban ? 'font-medium' : 'text-red-500 italic'}`}
                            >
                              {item.jawaban || 'Tidak dijawab'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-800 py-3 px-8 bg-gray-50 print:bg-white">
              <div className="text-center text-sm text-gray-600">
                SMK Bina Industri • Dicetak pada {new Date().toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            
            
            /* Sembunyikan element yang tidak perlu */
            .no-print {
              display: none !important;
              visibility: hidden !important;
            }
            
            /* Style untuk kertas */
            .bg-white {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              box-shadow: none !important;
              border: 0px !important;
            }
            
            /* Pastikan warna hijau tetap terlihat */
            .text-green-600 {
              color: #059669 !important;
              font-weight: bold !important;
            }
            
            /* Background colors untuk print */
            .bg-gray-200 {
              background-color: #e5e7eb !important;
            }
            
            /* Adjust spacing untuk print */
            .space-y-8 > div {
              margin-bottom: 2rem;
            }
            
            .py-6 {
              padding-top: 1.5rem !important;
              padding-bottom: 1.5rem !important;
            }
            
            .px-8 {
              padding-left: 2rem !important;
              padding-right: 2rem !important;
            }
          }

          @page {
            margin: 15mm;
            size: A4;
          }
        `}
      </style>
    </SiswaLayout>
  )
}
