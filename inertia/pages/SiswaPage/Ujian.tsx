// resources/js/Pages/Siswa/Ujian.tsx
import { router, usePage } from '@inertiajs/react'
import { ReactNode, useState, useEffect } from 'react'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { offlineStorage } from './offline_storage_service'
import { io } from 'socket.io-client'
import { getSocket } from './socket'
import { useNotification } from '~/Components/NotificationAlert'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export type Soal = {
  id: string
  nomor: number
  pertanyaan: string
  pilihan: { label: string; value: string }[]
  jawabanBenar: string
  gambar?: string
}

export type UjianState = {
  jawaban: Record<string, string>
  ragu: Record<string, boolean>
  nomorAktif: number
}

export default function Ujian({
  ujianId,
  kehadiranId,
  bankSoal,
  soalList,
  jawabanList,
  dataWebsite,
  user,
}: any) {
  const [ujianState, setUjianState] = useState<UjianState>({
    jawaban: {},
    ragu: {},
    nomorAktif: 1,
  })

  const [pinalti, setPialti] = useState({
    setWaktu: dataWebsite.timer_pinalty ?? 60,
    setPinalti: dataWebsite.pinalty ?? 0,
  })

  const [waktuSisa, setWaktuSisa] = useState<number>(bankSoal.waktu * 60)
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false)

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  const [offlineData, setOfflineData] = useState({
    isStorageSupported: false,
    pendingCount: 0,
    syncStatus: 'idle',
  })

  const [afkTime, setAFKTIME] = useState<number>(0)

  const [showPopup, setShowPopup] = useState<null | 'habis' | 'afk'>(null)
  const [focusTimer, setFocusTimer] = useState<boolean>(false)
  const [calculatePinalty, setCalculatePinalty] = useState(0)
  const [showSelesaiPopup, setShowSelesaiPopup] = useState(false)
  const [selesaiMessage, setSelesaiMessage] = useState('')

  const totalSoal = soalList.length

  const requestFullScreen = () => {
    if (document.fullscreenEnabled) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable full-screen mode: ${err.message}`)
      })
      setIsFullScreen(true)
    }
  }
  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => {
        requestFullScreen()
        console.log(`Error attempting to exit full-screen mode: ${err.message}`)
      })
      setIsFullScreen(false)
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      const fs = !!document.fullscreenElement
      setIsFullScreen(fs)
      if (!fs) {
        notify('Kamu Dalam Ujian. Harap Selesaikan Ujian Sebelum Keluar', 'info')
      }
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  const { notify } = useNotification()

  const socket = getSocket()

  useEffect(() => {
    socket.on('user_joined', (data: any) => {
      console.log('🟢', data.message)
    })

    return () => {
      socket.off('user_joined')
    }
  }, [])

  // Cegah reload, navigasi balik, dan close tab
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      notify('🚫 Jangan reload atau keluar dari halaman ujian!')
      if (calculatePinalty > 0) {
        handleAFKConfirm()
      }
      return ''
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.key === 'r' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault()
        if (calculatePinalty > 0) {
          handleAFKConfirm()
        }
        notify('🚫 Reload halaman dinonaktifkan selama ujian!')
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault()
      if (calculatePinalty > 0) {
        handleAFKConfirm()
      }
      notify('⚠️ Tidak bisa kembali ke halaman sebelumnya selama ujian!')
      router.visit(window.location.href, { replace: true })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('popstate', handlePopState)

    window.history.pushState(null, '', window.location.href)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  function sendMessage(message: any) {
    socket.emit('send_message', { message })
  }

  useEffect(() => {
    let lastFocusTime = 0

    const key = `ujian_${bankSoal.id}_endTime`
    const storedEndTime = localStorage.getItem(key)

    if (storedEndTime) {
      const endTime = new Date(storedEndTime).getTime()
      const now = Date.now()
      const sisa = Math.max(0, Math.floor((endTime - now) / 1000))
      setWaktuSisa(sisa)
    } else {
      const endTime = new Date(Date.now() + bankSoal.waktu * 60 * 1000)
      localStorage.setItem(key, endTime.toISOString())
      setWaktuSisa(bankSoal.waktu * 60)
    }

    getOfflineStorage()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        lastFocusTime = Date.now()
      } else if (document.visibilityState === 'visible') {
        const timeDiff = Date.now() - lastFocusTime
        const seconds = Math.floor(timeDiff / 1000)
        if (!showPopup) {
          setAFKTIME(seconds)
        }
      }
    }

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('fullscreenchange', handleFullScreenChange)

    requestFullScreen()

    if (localStorage?.pinalty) {
      console.log(localStorage?.pinalty)
      setCalculatePinalty(parseInt(localStorage?.pinalty))
      setAFKTIME(parseInt(localStorage?.afkTime))

      setShowPopup('afk')
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  useEffect(() => {
    if (waktuSisa <= 0) {
      setShowPopup('habis')
      return
    }
    if (afkTime > pinalti.setWaktu) {
      setShowPopup('afk')
      const pinalty = hitungPinalty(afkTime, pinalti.setWaktu, pinalti.setPinalti)
      setCalculatePinalty(pinalty)
      localStorage.setItem('afkTime', String(afkTime))
      localStorage.setItem('pinalty', String(pinalty))
      sendMessage(
        `Siswa Dengan Nama ${user.fullName} di ujian ${bankSoal.namaUjian} keluar selama ${formatTime(calculatePinalty)}`
      )
    }
  }, [afkTime, pinalti, waktuSisa])

  useEffect(() => {
    if (waktuSisa <= 0) {
      setShowPopup('habis')
      return
    }
    const interval = setInterval(() => {
      setWaktuSisa((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [waktuSisa])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const syncData = async () => {
      try {
        const pendingData = await offlineStorage.getUjian('pending')
        const allData = await offlineStorage.getUjian('all')

        if (pendingData && allData) {
          setOfflineData((props) => ({
            ...props,
            isStorageSupported: offlineStorage.isStorageSupported(),
            pendingCount: pendingData.length,
          }))
        }

        if (pendingData && pendingData.length > 0 && isOnline) {
          for (const record of pendingData) {
            await router.post(`/siswa/ujian/${ujianId}/saveJawaban`, record.jawaban, {
              onStart: () => {
                setOfflineData((props) => ({
                  ...props,
                  syncStatus: 'syncing',
                }))
              },
              onFinish: async () => {
                await offlineStorage.markAsSynced([0])
                setOfflineData((props) => ({
                  ...props,
                  syncStatus: 'success',
                }))
                console.log(`✅ Sinkronisasi ujian ${ujianId} selesai.`)
              },
              onError: (err) => {
                setOfflineData((props) => ({
                  ...props,
                  syncStatus: 'error',
                }))
                console.error(`❌ Gagal sinkronisasi ujian ${ujianId}:`, err)
              },
            })
          }
        }
      } catch (error) {
        setOfflineData((props) => ({
          ...props,
          syncStatus: 'error',
        }))
        console.error('❌ Error saat sinkronisasi offline data:', error)
      }
    }

    syncData()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOnline])

  const getOfflineStorage = async () => {
    const offlineData = await offlineStorage.getUjian('all')

    if (Array.isArray(offlineData) && offlineData.length > 0) {
      setUjianState(offlineData[0])
    } else {
      if (jawabanList) {
        const merged = Object?.assign({}, ...jawabanList)

        setUjianState({
          jawaban: merged,
          ragu: {},
          nomorAktif: 1,
        })
      }
    }
  }

  const handlePilihJawaban = (soalId: string, jawaban: string) => {
    setUjianState((prevState) => {
      const updated = {
        ...prevState,
        jawaban: { ...prevState.jawaban, [soalId]: jawaban },
        ragu: { ...prevState.ragu, [soalId]: false },
      }

      offlineStorage.saveUjian([updated])
      if (isOnline) {
        router.post(`/siswa/ujian/${ujianId}/saveJawaban`, updated?.jawaban, {
          onFinish: () => {
            offlineStorage.markAsSynced([0])
            setOfflineData((props) => ({
              ...props,
              syncStatus: 'idle',
            }))
            notify('Berhasil Menyimpan Jawaban', 'success', 500)
          },
          onError: (err) => {
            notify('Gagal Menyimpan Jawaban ' + err)
          },
        })
      }
      return updated
    })
  }

  const handleRagu = (soalId: string) => {
    if (ujianState?.jawaban?.[soalId]) {
      setUjianState((prevState) => ({
        ...prevState,
        ragu: { ...prevState.ragu, [soalId]: !prevState.ragu[soalId] },
      }))
    }
  }

  const handleNext = () => {
    if (ujianState?.nomorAktif < totalSoal) {
      setUjianState((prevState) => ({
        ...prevState,
        nomorAktif: prevState.nomorAktif + 1,
      }))
    }
  }

  const handlePrev = () => {
    if (ujianState?.nomorAktif > 1) {
      setUjianState((prevState) => ({
        ...prevState,
        nomorAktif: prevState.nomorAktif - 1,
      }))
    }
  }

  const handleNomorClick = (nomor: number) => {
    setUjianState((prev) => ({ ...prev, nomorAktif: nomor }))
  }

  const renderSoalList = () => {
    return soalList.map((soal: any) => {
      const isActive = soal.nomor === ujianState?.nomorAktif
      const isJawab = ujianState?.jawaban[soal.id] && ujianState?.jawaban[soal.id] != ''
      const isRagu = ujianState?.ragu[soal.id] || false

      return (
        <div
          key={soal.id}
          onClick={() => handleNomorClick(soal.nomor)}
          className={`flex items-center justify-center w-[30px] h-[30px] rounded cursor-pointer transition ${
            isActive
              ? 'bg-blue-500 text-white font-bold scale-110'
              : isRagu
                ? 'bg-yellow-200 text-gray-800'
                : isJawab
                  ? 'bg-green-200 text-gray-800'
                  : 'bg-gray-100 text-gray-600'
          }`}
        >
          <span>{soal.nomor}</span>
        </div>
      )
    })
  }

  const hitungPinalty = (waktuActual: number, setWaktu: number, setPinalti: number) => {
    return (waktuActual / setWaktu) * setPinalti
  }

  // Fungsi helper konversi detik → string fleksibel
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} Detik`
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60)
      const s = seconds % 60
      return s > 0 ? `${minutes} menit ${s} detik` : `${minutes} menit`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const s = seconds % 60
      let str = `${hours} jam`
      if (minutes > 0) str += ` ${minutes} menit`
      if (s > 0) str += ` ${s} detik`
      return str
    }
  }

  const handleAFKConfirm = () => {
    const key = `ujian_${bankSoal.id}_endTime`
    const storedEndTime = localStorage.getItem(key)
    if (storedEndTime) {
      const newEndTime = new Date(new Date(storedEndTime).getTime() - calculatePinalty * 1000)
      localStorage.setItem(key, newEndTime.toISOString())

      const sisa = Math.max(0, Math.floor((newEndTime.getTime() - Date.now()) / 1000))
      setWaktuSisa(sisa)
      localStorage.removeItem('pinalty')
    }

    setShowPopup(null)
    setAFKTIME(0)

    // Aktifkan fokus animasi
    setFocusTimer(true)
    setTimeout(() => setFocusTimer(false), 2000)
  }

  const semuaTerjawab = () => {
    return soalList.every(
      (soal: any) =>
        ujianState?.jawaban[soal.id] !== undefined && ujianState?.jawaban[soal.id] !== ''
    )
  }

  const masihRaguRagu = () => {
    return soalList.some((soal: any) => ujianState?.ragu[soal.id] === true)
  }

  const handleSelesai = () => {
    if (masihRaguRagu()) {
      setSelesaiMessage('Masih ada soal yang ditandai ragu-ragu. Periksa lagi sebelum submit.')
      setShowSelesaiPopup(true)
      return
    }
    setSelesaiMessage('Ujian selesai! Semua soal sudah terjawab.')
    setShowSelesaiPopup(true)
  }

  const handleSubmit = () => {
    setShowSelesaiPopup(false)
    exitFullScreen()

    router.post(`/siswa/ujian/${ujianId}/submitJawaban`, ujianState?.jawaban, {
      onStart: () => {
        setOfflineData((props) => ({
          ...props,
          syncStatus: 'syncing',
        }))
        const key = `ujian_${bankSoal.id}_endTime`
        localStorage.removeItem(key)
      },
      onSuccess: () => {
        setOfflineData((props) => ({
          ...props,
          syncStatus: 'success',
        }))

        router.visit('/siswa/jadwalujian')
      },
    })
  }

  return (
    <div className=" mx-auto lg:p-6 relative">
      <div className="flex items-center justify-between">
        <div>
          {(() => {
            if (!isOnline) {
              return (
                <span className="font-medium text-red-600">
                  Anda sedang offline, jawaban akan disinkronisasi saat Anda kembali online
                </span>
              )
            }

            if (offlineData?.syncStatus === 'syncing') {
              return <span className="text-purple-600 animate-pulse">Menyinkronisasi...</span>
            }

            if (offlineData?.syncStatus === 'success') {
              return <span className="text-green-600">✓ Berhasil disinkronisasi</span>
            }

            if (offlineData?.syncStatus === 'error') {
              return <span className="text-red-600">✗ Gagal sinkronisasi</span>
            }

            return null
          })()}
        </div>
      </div>
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold">Ujian</h2>
        {/* Timer Box */}
        <div
          className={`fixed transition-all duration-300 ease-in-out text-gray-900 bg-yellow-500 rounded-md px-2 py-1 ${focusTimer ? 'top-1/2 right-1/2 w-fit scale-105 bg-red-500 text-white animate-pulse translate-x-1/2 -translate-y-1/2' : 'right-10 top-24'}`}
        >
          Waktu: {Math.floor(waktuSisa / 60)}:{waktuSisa % 60 < 10 ? '0' : ''}
          {waktuSisa % 60}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Konten Soal */}
        <div className="w-full bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Soal Nomor {ujianState?.nomorAktif}</h3>
            <div>
              {semuaTerjawab() ? (
                <button
                  onClick={handleSelesai}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Selesai Ujian
                </button>
              ) : (
                <>
                  <button
                    onClick={handlePrev}
                    disabled={ujianState?.nomorAktif === 1}
                    className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={ujianState?.nomorAktif === totalSoal}
                    className="px-2 py-1 bg-gray-200 rounded ml-2 disabled:opacity-50"
                  >
                    Next
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Gambar Soal */}
          {soalList.find((s: any) => s.nomor === ujianState?.nomorAktif)?.gambar && (
            <img
              src={soalList.find((s: any) => s.nomor === ujianState?.nomorAktif)!.gambar}
              alt="Gambar Soal"
              className="w-full h-64 object-cover rounded-lg mb-4"
            />
          )}

          {/* Pertanyaan dan Pilihan */}
          <div className="mb-4">
            <h4
              className="text-lg font-semibold"
              dangerouslySetInnerHTML={{
                __html: soalList.find((s: any) => s.nomor === ujianState?.nomorAktif)?.pertanyaan,
              }}
            ></h4>
            <div className="mt-4">
              {soalList
                .find((s: any) => s.nomor === ujianState?.nomorAktif)
                ?.pilihan.map((pilihan: any) => (
                  <div key={pilihan.value} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name={`soal-${ujianState?.nomorAktif}`}
                      id={`soal-${ujianState?.nomorAktif}-${pilihan}`}
                      value={pilihan.value}
                      checked={
                        ujianState?.jawaban[soalList[ujianState?.nomorAktif - 1]?.id] ===
                        pilihan.value
                      }
                      onChange={() =>
                        handlePilihJawaban(soalList[ujianState?.nomorAktif - 1]?.id, pilihan.value)
                      }
                      className="mr-2"
                    />
                    <label
                      htmlFor={`soal-${ujianState?.nomorAktif}-${pilihan.value}`}
                      dangerouslySetInnerHTML={{ __html: pilihan.label }}
                    ></label>
                  </div>
                ))}
            </div>
          </div>

          {/* Tombol Ragu-Ragu */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              disabled={ujianState?.jawaban[soalList[ujianState?.nomorAktif - 1]?.id] == undefined}
              onClick={() => handleRagu(soalList[ujianState?.nomorAktif - 1].id)}
              className={`px-4 py-2 rounded ${
                ujianState?.jawaban[soalList[ujianState?.nomorAktif - 1]?.id] == undefined
                  ? 'cursor-not-allowed'
                  : 'cursor-pointer'
              } ${
                ujianState?.ragu[soalList[ujianState?.nomorAktif - 1]?.id]
                  ? 'bg-yellow-500 text-white'
                  : 'bg-yellow-200 text-gray-800'
              }`}
            >
              {ujianState?.ragu[soalList[ujianState?.nomorAktif - 1]?.id]
                ? 'Batal Ragu'
                : 'Ragu-Ragu'}
            </button>
          </div>
        </div>

        {/* List Nomor Soal */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-4">List Soal</h3>
          <div className="flex flex-wrap gap-2">{renderSoalList()}</div>
        </div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            {showPopup === 'habis' && (
              <>
                <h3 className="text-xl font-bold text-red-600 mb-4">Waktu Habis!</h3>
                <p className="mb-4">Waktu ujian kamu sudah berakhir.</p>
                <button
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={handleSubmit}
                >
                  Kirim Ujian
                </button>
              </>
            )}
            {showPopup === 'afk' && (
              <>
                <h3 className="text-xl font-bold text-yellow-600 mb-4">Kamu AFK!</h3>
                <p className="mb-4">
                  Kamu keluar dari halaman ujian selama {formatTime(afkTime)}. Waktu ujianmu akan
                  dipotong {formatTime(calculatePinalty)}.
                </p>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  onClick={handleAFKConfirm}
                >
                  Mengerti
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {showSelesaiPopup ? (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">Konfirmasi Ujian</h2>
            <p className="mb-6">{selesaiMessage}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowSelesaiPopup(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                Kembali
              </button>
              {!masihRaguRagu() && (
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Kirim Ujian
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

Ujian.layout = (page: ReactNode) => (
  <SiswaLayout title="Ujian" sideHide={true}>
    {page}
  </SiswaLayout>
)
