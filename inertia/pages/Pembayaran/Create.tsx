import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import Form from './Form'
import { Pembayaran } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create({
  users,
  jenisPembayaranOptions,
  existingData,
  prefilledData,
}: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const userOptions = users.map((item: any) => {
    return { label: item.fullName, value: item.id }
  })

  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    if (existingData && data.action === 'update') {
      // Update existing data
      router.put(`${url}/${existingData.id}`, data, {
        onSuccess: ({ props }: any) => {
          if (props.session.status == 'success') {
            router.visit(url)
          }

          props.session.error.messages.map((m: any) => notify(m.message, 'error'))
        },
      })
    } else {
      // Create new data
      router.post(url, data, {
        onSuccess: () => {
          router.visit(url)
        },
      })
    }
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {existingData ? 'Update Penetapan Pembayaran' : 'Tambah Data Pembayaran'}
      </h1>
      <Form
        userOptions={userOptions}
        jenisPembayaranOptions={jenisPembayaranOptions}
        existingData={existingData}
        prefilledData={prefilledData}
        onSubmit={handleSubmit}
        submitLabel="Simpan"
      />
    </div>
  )
}

Create.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
