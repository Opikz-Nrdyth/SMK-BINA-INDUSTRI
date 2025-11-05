import { router, usePage } from '@inertiajs/react'
import React, { useMemo } from 'react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Kelas } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ kelas, guruWithMapel, dataSiswa }: any) {
  const initialValues: Kelas = {
    jenjang: kelas.jenjang,
    namaKelas: kelas.namaKelas,
    siswa: typeof kelas.siswa == 'string' ? JSON.parse(kelas.siswa) : kelas.siswa,
    waliKelas: kelas.waliKelas,
    guruPengampu:
      typeof kelas.guruPengampu == 'string' ? JSON.parse(kelas.guruPengampu) : kelas.guruPengampus,
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const guru = useMemo(() => {
    if (!guruWithMapel) return []

    return guruWithMapel.map((item: any) => ({
      label: `${item?.fullName}${item.mataPelajaran ? ` - ${item.mataPelajaran[0]?.namaMataPelajaran || ''}` : ''}`,
      value: item.nip,
    }))
  }, [guruWithMapel])
  const siswa = useMemo(() => {
    return dataSiswa.map((item: any) => ({
      label: item.user.fullName,
      value: item.nisn,
    }))
  }, [dataSiswa])

  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    router.put(`${url}/${kelas.id}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        } else {
          props.session.error.messages.map((m: any) => notify(m.message, 'error'))
        }
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Data Staf</h1>
      <Form
        initialValues={initialValues}
        guruOption={guru}
        siswaOption={siswa}
        onSubmit={handleSubmit}
        submitLabel="Update"
      />
    </div>
  )
}

Edit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
