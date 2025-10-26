import React, { useState, useEffect, useRef } from 'react'
import { Link, router, usePage } from '@inertiajs/react'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'

interface InvoiceData {
  id: string
  siswa: string
  nisn: string
  jenisPembayaran: string
  nominalPenetapan: string
  totalDibayar: number
  sisaPembayaran: number
  lunas: boolean
  riwayatPembayaran: Array<{
    nominal: string
    tanggal: string
  }>
  tanggalCetak: string
  nomorInvoice: string
}

export default function CetakInvoice({ auth, pembayaranId }: { auth: any; pembayaranId: string }) {
  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paperSize, setPaperSize] = useState('A4')
  const [customWidth, setCustomWidth] = useState('21')
  const [customHeight, setCustomHeight] = useState('29.7')
  const invoiceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadInvoiceData()
  }, [pembayaranId])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${url}/${pembayaranId}/cetak-invoice`)
      const result = await response.json()

      if (result.success) {
        setInvoiceData(result.data)
      }
    } catch (error) {
      console.error('Error loading invoice data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const paperSizes = {
    A4: { name: 'A4 (21.0 x 29.7 cm)', class: 'a4-paper' },
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Gagal memuat data invoice</p>
          <button
            onClick={loadInvoiceData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Controls */}
      <div className="max-w-4xl mx-auto mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-wrap items-center justify-end gap-4">
          <div className="flex space-x-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1"
            >
              <i className="fas fa-print"></i>
              Print
            </button>
            <Link
              href={url}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Kembali
            </Link>
          </div>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="flex justify-center">
        <div
          ref={invoiceRef}
          className={`bg-white shadow-lg ${paperSizes[paperSize as keyof typeof paperSizes]?.class} mx-auto`}
          style={
            paperSize === 'custom'
              ? {
                  width: `${customWidth}cm`,
                  height: `${customHeight}cm`,
                  minHeight: `${customHeight}cm`,
                }
              : {}
          }
        >
          {/* Header */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
            <h1 className="text-xl font-bold uppercase mb-2">Sekolah Menengah Atas Negeri 1</h1>
            <p className="text-sm text-gray-600">Jl. Pendidikan No. 123, Jakarta Selatan</p>
            <p className="text-sm text-gray-600">Telp: (021) 1234567 | Email: info@sman1.sch.id</p>
          </div>

          {/* Invoice Title */}
          <h2 className="text-2xl font-bold text-center mb-8 uppercase">Invoice Pembayaran</h2>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium py-1">Nomor Invoice</td>
                    <td className="py-1">: {invoiceData.nomorInvoice}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1">Tanggal Cetak</td>
                    <td className="py-1">: {invoiceData.tanggalCetak}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1">Nama Siswa</td>
                    <td className="py-1">: {invoiceData.siswa}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1">NISN</td>
                    <td className="py-1">: {invoiceData.nisn || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="font-medium py-1">Jenis Pembayaran</td>
                    <td className="py-1">: {invoiceData.jenisPembayaran}</td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1">Status</td>
                    <td className="py-1">
                      :{' '}
                      <span
                        className={`font-bold ${invoiceData.lunas ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {invoiceData.lunas ? 'LUNAS' : 'BELUM LUNAS'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-4 border-b pb-2">Rincian Pembayaran</h3>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-gray-800">
                  <th className="text-left py-2 font-bold">No</th>
                  <th className="text-left py-2 font-bold">Keterangan</th>
                  <th className="text-right py-2 font-bold">Nominal</th>
                  <th className="text-center py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Penetapan */}
                <tr className="border-b">
                  <td className="py-3">1</td>
                  <td className="py-3">Penetapan Biaya</td>
                  <td className="py-3 text-right">
                    {formatRupiah(parseFloat(invoiceData.nominalPenetapan))}
                  </td>
                  <td className="py-3 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
                      WAJIB
                    </span>
                  </td>
                </tr>

                {/* Riwayat Pembayaran */}
                {invoiceData.riwayatPembayaran.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">{index + 2}</td>
                    <td className="py-3">
                      Pembayaran {index + 1} - {formatDate(item.tanggal)}
                    </td>
                    <td className="py-3 text-right">{formatRupiah(parseFloat(item.nominal))}</td>
                    <td className="py-3 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        DIBAYAR
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary */}
            <div className="border-t-2 border-gray-800 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold">Total Dibayar:</span>
                <span className="font-bold">{formatRupiah(invoiceData.totalDibayar)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold">Sisa Pembayaran:</span>
                <span
                  className={`font-bold ${invoiceData.lunas ? 'text-green-600' : 'text-red-600'}`}
                >
                  {formatRupiah(invoiceData.sisaPembayaran)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <div className="text-center text-sm text-gray-600 mb-4">
              <p>Terima kasih atas pembayaran Anda.</p>
              <p>Invoice ini sah dan dapat digunakan sebagai bukti pembayaran.</p>
            </div>

            <div className="flex justify-between items-end">
              <div></div>
              <div className="text-center">
                <p className="mb-16">Hormat Kami,</p>
                <p className="border-t border-gray-400 pt-2 w-32 mx-auto">Bendahara Sekolah</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .a4-paper, .a4-paper * {
            visibility: visible;
          }
          .a4-paper {
            position: absolute;
            left: 0;
            top: 0;
            width: 21cm;
            height: 29.7cm;
            margin: 0;
            padding: 1cm;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .a4-paper {
          width: 21cm;
          min-height: 29.7cm;
          padding: 2cm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .a5-paper {
          width: 14.8cm;
          min-height: 21cm;
          padding: 1.5cm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .a6-paper {
          width: 10.5cm;
          min-height: 14.8cm;
          padding: 1cm;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .custom-paper {
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          padding: 1.5cm;
        }
      `}</style>
    </div>
  )
}

CetakInvoice.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
