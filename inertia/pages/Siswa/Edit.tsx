import { router, usePage } from '@inertiajs/react'
import SiswaForm from './Form'
import { Siswa, SiswaFormData } from './types'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function SiswaEdit({ siswa }: { siswa: Siswa }) {
  const initialValues: SiswaFormData = {
    user: {
      fullName: siswa.user.fullName,
      email: siswa.user.email,
    },
    siswa: {
      nisn: siswa.nisn,
      nik: siswa.nik || '',
      noAktaLahir: siswa.noAktaLahir,
      noKk: siswa.noKk || '',
      jenisKelamin: siswa.jenisKelamin,
      tempatLahir: siswa.tempatLahir,
      tanggalLahir: siswa.tanggalLahir,
      agama: siswa.agama,
      kewarganegaraan: siswa.kewarganegaraan,
      alamat: siswa.alamat,
      rt: siswa.rt,
      rw: siswa.rw,
      dusun: siswa.dusun || '',
      kelurahan: siswa.kelurahan || '',
      kecamatan: siswa.kecamatan,
      kodePos: siswa.kodePos,
      jenisTinggal: siswa.jenisTinggal,
      transportasi: siswa.transportasi || '',
      noTelepon: siswa.noTelepon,
      anakKe: siswa.anakKe,
      jumlahSaudara: siswa.jumlahSaudara,
      penerimaKip: siswa.penerimaKip,
      beratBadan: siswa.beratBadan || '',
      tinggiBadan: siswa.tinggiBadan || '',
      lingkarKepala: siswa.lingkarKepala || '',
      jarakSekolah: siswa.jarakSekolah || '',
      waktuTempuh: siswa.waktuTempuh || '',
      jenisKesejahteraan: siswa.jenisKesejahteraan,
      nomorKartu: siswa.nomorKartu || '',
      namaDiKartu: siswa.namaDiKartu || '',
      jenisPendaftaran: siswa.jenisPendaftaran,
      sekolahAsal: siswa.sekolahAsal,
      npsn: siswa.npsn || '',
      sekolahAsalPindahan: siswa.sekolahAsalPindahan || '',
      suratKeteranganPindah: siswa.suratKeteranganPindah || '',
      hobby: siswa.hobby || '',
      citacita: siswa.citacita || '',
      noKps: siswa.noKps || '',
      fileAkta: siswa.fileAkta || '',
      fileKk: siswa.fileKk || '',
      fileIjazah: siswa.fileIjazah || '',
      fileFoto: siswa.fileFoto || '',
    },
    walis: siswa.dataWalis || [],
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.put(`/${pattern[0] + '/' + pattern[1]}/${data.siswa.nisn}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(`/${pattern[0] + '/' + pattern[1]}`)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
      onError: (errors) => {
        console.log('Validation errors:', errors)
      },
      preserveState: true,
      preserveScroll: true,
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Data Siswa</h1>
      <SiswaForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update" />
    </div>
  )
}

SiswaEdit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
