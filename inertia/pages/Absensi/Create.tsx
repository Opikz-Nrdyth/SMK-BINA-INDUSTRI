import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import Form from './Form'
import { AbsensiForm, AbsensiItem } from './types'
import GuruLayout from '~/Layouts/GuruLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create({ accessibleKelas, mapels, today, flashMessages }: any) {
  const initialValues: AbsensiItem = {
    userId: '',
    mapelId: '',
    kelasId: '',
    status: 'Hadir',
    hari: '',
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')

  const mapelOptions = mapels.map((item: any) => {
    return { label: item.namaMataPelajaran, value: item.id }
  })

  const kelasOptions = accessibleKelas.map((item: any) => {
    return { label: item.namaKelas, value: item.id }
  })
  const { notify } = useNotification()

  const handleSubmit = (data: any) => {
    router.post(`/${pattern}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(`/${pattern[0] + '/' + pattern[1]}`)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
      onError: (errors) => {
        console.error('Error updating absensi:', errors)
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Data Absensi</h1>
      <Form
        initialValues={initialValues}
        mapelOptions={mapelOptions}
        kelasOptions={kelasOptions}
        onSubmit={handleSubmit}
        submitLabel="Update"
      />
    </div>
  )
}

Create.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
