import { router } from '@inertiajs/react'
import React from 'react'
import { Notification } from '~/Components/Notification'
import { Staf, StafFormData } from './types'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ staf }: { staf: Staf }) {
  const initialValues: StafFormData = {
    user: {
      fullName: staf.user.fullName,
      email: staf.user.email,
      role: 'Staf',
    },
    staf: {
      agama: staf.agama,
      alamat: staf.alamat,
      departemen: staf.departemen,
      gelarBelakang: staf.gelarBelakang,
      gelarDepan: staf.gelarDepan,
      jabatan: staf.jabatan,
      jenisKelamin: staf.jenisKelamin,
      nip: staf.nip,
      noTelepon: staf.noTelepon,
      tanggalLahir: staf.tanggalLahir,
      tempatLahir: staf.tempatLahir,
      fileFoto: staf.fileFoto,
    },
  }
  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    router.put(`/SuperAdmin/manajemen-staf/${data.staf.nip}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit('/SuperAdmin/manajemen-staf/')
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Data Staf</h1>
      <Form initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update" />
    </div>
  )
}

Edit.layout = (page: any) => <SuperAdminLayout>{page}</SuperAdminLayout>
