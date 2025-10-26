import { router, usePage } from '@inertiajs/react'
import React from 'react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Informasi } from './types'
import { formatDateTimeLocal } from '~/Components/FormatWaktu'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ informasi }: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const initialValues: Informasi = {
    judul: informasi.judul,
    deskripsi: informasi.deskripsi,
    roleTujuan: informasi.roleTujuan,
    publishAt: formatDateTimeLocal(informasi.publishAt),
    closeAt: formatDateTimeLocal(informasi.closeAt),
  }
  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    router.put(`${url}/${informasi.id}`, data, {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Informasi</h1>
      <Form
        initialValues={initialValues}
        onSubmit={handleSubmit}
        dataKontak={props.allContacts as any}
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
