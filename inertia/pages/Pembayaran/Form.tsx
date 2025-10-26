import React, { useState, useEffect } from 'react'
import { useForm, router, Link, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { Pembayaran } from './types'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: Pembayaran
  onSubmit: (data: Pembayaran & { action?: string }) => void
  submitLabel: string
  dark?: boolean
  userOptions?: options[]
  jenisPembayaranOptions?: string[]
  existingData?: any
  prefilledData?: any
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  userOptions,
  jenisPembayaranOptions,
  existingData,
  prefilledData,
}: Props) {
  const { data, setData, processing, errors } = useForm<Pembayaran & { action?: string }>(
    prefilledData ||
      initialValues || {
        userId: '',
        jenisPembayaran: '',
        nominalPenetapan: '',
        action: '',
      }
  )

  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)

  // Auto-fill dari prefilledData
  useEffect(() => {
    if (prefilledData) {
      setData(prefilledData)
    }
  }, [prefilledData])

  // Cek existing data ketika user dan jenis pembayaran dipilih
  useEffect(() => {
    if (data.userId && data.jenisPembayaran && !existingData) {
      checkExistingData()
    }
  }, [data.userId, data.jenisPembayaran])

  const checkExistingData = async () => {
    try {
      const response = await fetch(
        `${url}/check-existing?user_id=${data.userId}&jenis_pembayaran=${data.jenisPembayaran}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json',
          },
        }
      )

      if (response.ok) {
        const result = await response.json()

        // ✅ PERBAIKAN: Gunakan result.data bukan result.props.existingData
        if (result.success && result.exists && result.data) {
          setConfirmationData(result.data)
          setShowConfirmation(true)
        } else {
          console.log('No existing data found') // Debug log
        }
      }
    } catch (error) {
      console.error('Error checking existing data:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!data.userId || !data.jenisPembayaran || !data.nominalPenetapan) {
      alert('Harap lengkapi semua field')
      return
    }

    // Jika ada existing data dan belum memilih action, tampilkan konfirmasi
    if (existingData && !data.action) {
      setConfirmationData(existingData)
      setShowConfirmation(true)
      return
    }

    onSubmit(data)
  }

  const handleConfirmation = (action: 'update' | 'cancel') => {
    if (action === 'update') {
      setData('action', 'update')
      setShowConfirmation(false)
    } else {
      // Reset form jika cancel
      setData({
        userId: '',
        jenisPembayaran: '',
        nominalPenetapan: '',
        action: '',
      })
      setShowConfirmation(false)
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const jenisOptions =
    jenisPembayaranOptions?.map((jenis) => ({
      label: jenis,
      value: jenis,
    })) || []

  return (
    <div className="space-y-6">
      {/* Modal Konfirmasi */}
      {showConfirmation && confirmationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg w-[500px] max-w-[90vw] p-6">
            <h3 className="text-lg font-bold text-yellow-600 mb-4">⚠️ Data Sudah Ada</h3>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
              <p className="text-yellow-800 mb-3">
                Siswa <strong>{confirmationData.user?.fullName}</strong> sudah memiliki penetapan
                pembayaran untuk <strong>{confirmationData.jenisPembayaran}</strong>.
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Nominal Penetapan Saat Ini:</span>
                  <strong>
                    {formatRupiah(parseFloat(confirmationData.nominalPenetapan || '0'))}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Total Sudah Dibayar:</span>
                  <strong>
                    {formatRupiah(
                      confirmationData.nominalBayar
                        ? confirmationData.nominalBayar.reduce(
                            (total: number, bayar: any) => total + parseFloat(bayar.nominal || '0'),
                            0
                          )
                        : 0
                    )}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Nominal Baru:</span>
                  <strong>{formatRupiah(parseFloat(data.nominalPenetapan || '0'))}</strong>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mb-4">Apa yang ingin Anda lakukan?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleConfirmation('cancel')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Batal & Reset Form
              </button>
              <button
                onClick={() => handleConfirmation('update')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Update Penetapan
              </button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="select"
            name="userId"
            label="Siswa"
            value={data.userId}
            onChange={(v: any) => setData('userId', v)}
            options={userOptions || []}
            required
            dark={dark}
          />

          <UniversalInput
            type="select"
            name="jenisPembayaran"
            label="Jenis Pembayaran"
            value={data.jenisPembayaran}
            onChange={(v: any) => setData('jenisPembayaran', v)}
            options={jenisOptions}
            required
            dark={dark}
          />

          <div className="md:col-span-2">
            <UniversalInput
              type="currency"
              name="nominalPenetapan"
              label="Nominal Penetapan"
              value={data.nominalPenetapan}
              onChange={(v: any) => setData('nominalPenetapan', v)}
              required
              dark={dark}
            />
          </div>
        </div>

        {/* Informasi Existing Data */}
        {existingData && !showConfirmation && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800">
                  <strong>Info:</strong> Data untuk siswa ini sudah ada. Silakan submit form untuk
                  mengupdate penetapan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Lihat Detail
              </button>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link
            href={url}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={processing}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 transition-colors"
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <span>{existingData ? 'Update Penetapan' : submitLabel}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

Form.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
