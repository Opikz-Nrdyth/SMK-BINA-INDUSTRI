import { router, usePage } from '@inertiajs/react'
import React from 'react'
import Form from './Form'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create() {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.post(url, data, {
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
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Tambah Aktivitas</h1>
      <Form onSubmit={handleSubmit} submitLabel="Simpan Aktivitas" />
    </div>
  )
}

Create.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  return activeRole === 'Staf' ? (
    <StafLayout>{page}</StafLayout>
  ) : (
    <SuperAdminLayout>{page}</SuperAdminLayout>
  )
}
