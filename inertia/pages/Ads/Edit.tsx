import { router, usePage } from '@inertiajs/react'
import React from 'react'
import Form from './Form'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ ad }: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const initialValues = {
    ...ad,
    tanggal_mulai: ad.tanggalMulai ? new Date(ad.tanggalMulai).toISOString().slice(0, 10) : '',
    tanggal_selesai: ad.tanggalSelesai
      ? new Date(ad.tanggalSelesai).toISOString().slice(0, 10)
      : '',
    gambar: ad.gambar || undefined,
  }
  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    const hasFile = data.gambar && typeof data.gambar !== 'string'
    if (hasFile) {
      const formData = new FormData()
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key])
        }
      })

      router.post(`${url}/${ad.id}?_method=PUT`, formData, {
        preserveScroll: true,
        onSuccess: ({ props }: any) => {
          if (props.session.status == 'success') {
            router.visit(url)
          }

          props.session.error.messages.map((m: any) => notify(m.message, 'error'))
        },
      })
    } else {
      // remove gambar key jika kosong supaya tidak overwrite (optional)
      const payload = { ...data }
      if (!payload.gambar) delete payload.gambar
      router.put(`${url}/${ad.id}`, payload, {
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Ads: {ad.judul}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Perbarui iklan internal</p>
      </div>
      <Form initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update Ads" />
    </div>
  )
}

Edit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  return activeRole === 'Staf' ? (
    <StafLayout>{page}</StafLayout>
  ) : (
    <SuperAdminLayout>{page}</SuperAdminLayout>
  )
}
