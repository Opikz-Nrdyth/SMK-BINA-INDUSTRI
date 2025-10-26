import React, { useState } from 'react'
import { useForm, router, Link, usePage } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { PembayaranItem, TambahPembayaran } from './types'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface options {
  label: string
  value: string
}

interface Props {
  initialValues?: PembayaranItem
  onSubmit: (data: PembayaranItem) => void
  submitLabel: string
  dark?: boolean
  userOptions?: options[]
  jenisPembayaranOptions?: string[]
}

export default function FormEdit({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  userOptions,
  jenisPembayaranOptions,
}: Props) {
  const { data, setData, processing, errors } = useForm<PembayaranItem>(
    initialValues || {
      userId: '',
      jenisPembayaran: '',
      nominalPenetapan: '',
      nominalBayar: '[]',
    }
  )

  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const [tambahPembayaran, setTambahPembayaran] = useState<TambahPembayaran>({
    nominal: '',
    tanggal: new Date().toISOString().split('T')[0],
  })

  const [showTambahForm, setShowTambahForm] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(data)
  }

  const handleTambahPembayaran = (e: React.FormEvent) => {
    e.preventDefault()

    if (!tambahPembayaran.nominal || !tambahPembayaran.tanggal) {
      alert('Harap isi nominal dan tanggal pembayaran')
      return
    }

    const nominal = parseFloat(tambahPembayaran.nominal)
    if (isNaN(nominal) || nominal <= 0) {
      alert('Nominal harus berupa angka yang valid dan lebih dari 0')
      return
    }

    // Validasi client-side: tidak melebihi sisa pembayaran
    const sisaPembayaran = initialValues?.sisaPembayaran || 0
    if (nominal > sisaPembayaran) {
      alert(
        `Nominal pembayaran (${formatRupiah(nominal)}) melebihi sisa pembayaran (${formatRupiah(sisaPembayaran)}).\n\n` +
          `Maksimal yang bisa dibayar: ${formatRupiah(sisaPembayaran)}`
      )
      return
    }

    // Validasi client-side: tidak melebihi nominal penetapan
    const totalDibayar = initialValues?.totalDibayar || 0
    const nominalPenetapan = parseFloat(initialValues?.nominalPenetapan || '0')
    if (totalDibayar + nominal > nominalPenetapan) {
      alert(
        `Total pembayaran akan melebihi nominal penetapan.\n\n` +
          `Sudah dibayar: ${formatRupiah(totalDibayar)}\n` +
          `Penetapan: ${formatRupiah(nominalPenetapan)}\n` +
          `Maksimal bisa bayar: ${formatRupiah(sisaPembayaran)}`
      )
      return
    }

    // Konfirmasi sebelum submit
    if (
      !confirm(
        `Tambahkan pembayaran sebesar ${formatRupiah(nominal)}?\n\nSisa setelah bayar: ${formatRupiah(sisaPembayaran - nominal)}`
      )
    ) {
      return
    }

    // Tambahkan pembayaran baru
    router.post(`${url}/${initialValues?.id}/tambah-pembayaran`, tambahPembayaran, {
      onSuccess: () => {
        setTambahPembayaran({ nominal: '', tanggal: new Date().toISOString().split('T')[0] })
        setShowTambahForm(false)
        // Refresh page untuk menampilkan data terbaru
        router.reload()
      },
      onError: (errors) => {
        console.error('Error menambah pembayaran:', errors)
        alert('Gagal menambah pembayaran. Silakan coba lagi.')
      },
    })
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalDibayar = initialValues?.totalDibayar || 0
  const sisaPembayaran = initialValues?.sisaPembayaran || 0
  const nominalPenetapan = parseFloat(initialValues?.nominalPenetapan || '0')
  const lunas = sisaPembayaran <= 0

  const jenisOptions =
    jenisPembayaranOptions?.map((jenis) => ({
      label: jenis,
      value: jenis,
    })) || []

  return (
    <div className="space-y-6">
      {/* Informasi Pembayaran Saat Ini */}
      <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-200">
        <h3 className="text-lg font-medium text-blue-800 dark:text-blue-400 mb-4">
          Informasi Pembayaran Saat Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm dark:text-white">
          <div>
            <span className="font-medium">Siswa:</span> {initialValues?.userName}
          </div>
          <div>
            <span className="font-medium">Jenis Pembayaran:</span> {initialValues?.jenisPembayaran}
          </div>
          <div>
            <span className="font-medium">Nominal Penetapan:</span> {formatRupiah(nominalPenetapan)}
          </div>
          <div>
            <span className="font-medium">Total Dibayar:</span> {formatRupiah(totalDibayar)}
          </div>
          <div>
            <span className="font-medium">Sisa Pembayaran:</span>
            <span className={`ml-2 font-bold ${lunas ? 'text-green-600' : 'text-red-600'}`}>
              {formatRupiah(sisaPembayaran)}
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span
              className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                lunas ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {lunas ? 'LUNAS' : 'BELUM LUNAS'}
            </span>
          </div>
        </div>
      </div>

      {/* Form Edit Data Dasar */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Edit Data Pembayaran
          </h3>
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
        </div>

        {/* Tombol Submit Edit */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Link
            href={url}
            className="px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Kembali
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
              <span>{submitLabel}</span>
            )}
          </button>
        </div>
      </form>

      {/* Riwayat Pembayaran */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Riwayat Pembayaran</h3>
          {!lunas && (
            <button
              onClick={() => setShowTambahForm(!showTambahForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              + Tambah Pembayaran
            </button>
          )}
        </div>

        {/* Form Tambah Pembayaran */}
        {showTambahForm && !lunas && (
          <form
            onSubmit={handleTambahPembayaran}
            className="bg-yellow-50 dark:bg-gray-700 p-4 rounded-lg border border-yellow-200 mb-4"
          >
            <h4 className="font-medium text-yellow-800 dark:text-white mb-3">
              Tambah Pembayaran Baru
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UniversalInput
                type="currency"
                name="nominal"
                label="Nominal Bayar"
                value={tambahPembayaran.nominal}
                onChange={(v: any) => setTambahPembayaran((prev) => ({ ...prev, nominal: v }))}
                required
                dark={dark}
              />

              <UniversalInput
                type="date"
                name="tanggal"
                label="Tanggal Bayar"
                value={tambahPembayaran.tanggal}
                onChange={(v: any) => setTambahPembayaran((prev) => ({ ...prev, tanggal: v }))}
                required
                dark={dark}
              />

              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setShowTambahForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Daftar Riwayat Pembayaran */}
        {initialValues?.riwayatPembayaran && initialValues.riwayatPembayaran.length > 0 ? (
          <div className="space-y-3">
            {initialValues.riwayatPembayaran.map((item: any, index: number) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatRupiah(parseFloat(item.nominal))}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.tanggal).toLocaleDateString('id-ID')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
            <p className="mt-2">Belum ada riwayat pembayaran</p>
          </div>
        )}
      </div>

      {errors && Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h4 className="text-red-800 font-medium mb-2">Terjadi kesalahan:</h4>
          <ul className="list-disc list-inside text-red-700 text-sm">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

FormEdit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
