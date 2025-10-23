// PPDBClosed.jsx
import { Link } from '@inertiajs/react'
import React, { useState, useEffect } from 'react'

export default function PPDBClosed({ ta }: any) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const now = new Date()
  const currentYear = now.getFullYear()
  const prevYear = currentYear - 1
  const fallbackTahun = `${prevYear}/${currentYear}`

  // ✅ Tangani error atau null
  const tahunAjaran =
    ta && typeof ta.tahunAjaran === 'string' && ta.tahunAjaran.trim() !== ''
      ? ta.tahunAjaran
      : fallbackTahun

  return (
    <>
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px) rotate(0deg); }
          50%  { transform: translateY(-25px) rotate(8deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.08;
          animation: float 12s ease-in-out infinite;
        }
        .shape-1 { width: 80px; height: 80px; top: 10%; left: 5%;  background: #ec4899; animation-delay: 0s; }
        .shape-2 { width: 60px; height: 60px; top: 70%; left: 80%; background: #a855f7; animation-delay: 2s; }
        .shape-3 { width: 45px; height: 45px; top: 40%; left: 90%; background: #d946ef; animation-delay: 4s; }
        .shape-4 { width: 70px; height: 70px; top: 85%; left: 15%; background: #f472b6; animation-delay: 1s; }
        .shape-5 { width: 55px; height: 55px; top: 20%; left: 70%; background: #c084fc; animation-delay: 3s; }

        
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 overflow-hidden relative">
        {/* background floating elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="floating-shape shape-1" />
          <div className="floating-shape shape-2" />
          <div className="floating-shape shape-3" />
          <div className="floating-shape shape-4" />
          <div className="floating-shape shape-5" />
        </div>

        {/* main card */}
        <div
          className={`relative z-10 max-w-3xl w-full transition-all duration-1000 ease-out 
            ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30 relative overflow-hidden">
            {/* header */}
            <div className="text-center mb-8">
              <div className="mb-6">
                <div className="inline-block relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <i className="fas fa-lock text-6xl text-pink-500 relative z-10" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-4">
                PPDB TUTUP
              </h1>
              <p className="text-lg md:text-xl text-gray-600 font-medium">
                Pendaftaran Peserta Didik Baru tahun ajaran {tahunAjaran} telah ditutup
              </p>
            </div>

            {/* info box */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
              <div className="flex items-start space-x-4">
                <i className="fas fa-info-circle text-pink-500 text-2xl mt-1 animate-bounce" />
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Informasi Penting</h3>
                  <p className="text-gray-600">
                    Pantau terus website kami untuk info pembukaan PPDB tahun ajaran berikutnya.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-5">
              <Link
                href="/"
                className="bg-purple-600 w-[60%] py-2 rounded-md text-center text-white"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
