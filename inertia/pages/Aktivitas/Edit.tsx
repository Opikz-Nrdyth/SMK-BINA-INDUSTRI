import { router, usePage } from '@inertiajs/react'
import React from 'react'
import Form from './Form'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ aktivitas }: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const initialValues = {
    ...aktivitas,
    tanggal_pelaksanaan: aktivitas.tanggalPelaksanaan
      ? new Date(aktivitas.tanggalPelaksanaan).toISOString().slice(0, 10)
      : '',
    dokumentasi: aktivitas.dokumentasi || '',
  }

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    // kalau ada file baru, kirim pakai FormData
    const hasFile = data.dokumentasi && typeof data.dokumentasi !== 'string'
    if (hasFile) {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      })
      router.post(`${url}/${aktivitas.id}?_method=PUT`, formData, {
        preserveScroll: true,
        onSuccess: ({ props }: any) => {
          if (props.session.status == 'success') {
            router.visit(url)
          }

          props.session.error.messages.map((m: any) => notify(m.message, 'error'))
        },
      })
    } else {
      router.put(`${url}/${aktivitas.id}`, data, {
        preserveScroll: true,
        onSuccess: ({ props }: any) => {
          if (props.session.status == 'success') {
            router.visit(url)
          }

          props.session.error.messages.map((m: any) => notify(m.message, 'error'))
        },
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Aktivitas: {aktivitas.nama}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Perbarui informasi aktivitas sekolah di bawah ini
        </p>
      </div>
      <Form initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update Aktivitas" />
    </div>
  )
}

Edit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole === 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
