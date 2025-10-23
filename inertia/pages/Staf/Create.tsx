import { router } from '@inertiajs/react'
import React from 'react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create() {
  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.post('/SuperAdmin/manajemen-staf', data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit('/SuperAdmin/manajemen-staf')
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Staf Baru</h1>
      <Form onSubmit={handleSubmit} submitLabel="Simpan" />
    </div>
  )
}

Create.layout = (page: any) => <SuperAdminLayout>{page}</SuperAdminLayout>
