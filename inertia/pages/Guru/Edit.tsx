import { router, usePage } from '@inertiajs/react'
import React from 'react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { GuruFormData } from './types'
import { Staf } from '../Staf/types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ guru }: { guru: Staf }) {
  const initialValues: GuruFormData = {
    user: {
      fullName: guru.user.fullName,
      email: guru.user.email,
    },
    guru: {
      agama: guru.agama,
      alamat: guru.alamat,
      gelarBelakang: guru.gelarBelakang,
      gelarDepan: guru.gelarDepan,
      jenisKelamin: guru.jenisKelamin,
      nip: guru.nip,
      noTelepon: guru.noTelepon,
      tanggalLahir: guru.tanggalLahir,
      tempatLahir: guru.tempatLahir,
      fileFoto: guru.fileFoto,
    },
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.put(`${url}/${data.guru.nip}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Data Guru</h1>
      <Form initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update" />
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
