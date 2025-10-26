import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import FormEdit from './FormEdit'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { AbsensiItem } from './types'
import GuruLayout from '~/Layouts/GuruLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ absensi, users, mapels, accessibleKelas }: any) {
  const initialValues: AbsensiItem = {
    id: absensi.id,
    userId: absensi.userId,
    mapelId: absensi.mapelId,
    kelasId: absensi.kelasId,
    status: absensi.status,
    hari: absensi.hari,
    userName: absensi.userName,
    mapelName: absensi.mapelName,
    kelasName: absensi.kelasName,
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')

  const userOptions = users.map((item: any) => {
    return { label: item.fullName, value: item.id }
  })

  const mapelOptions = mapels.map((item: any) => {
    return { label: item.namaMataPelajaran, value: item.id }
  })

  const kelasOptions = accessibleKelas.map((item: any) => {
    return { label: item.namaKelas, value: item.id }
  })

  const { notify } = useNotification()
  const handleSubmit = (data: AbsensiItem) => {
    router.put(`/SuperAdmin/laporan-absensi/${absensi.id}`, data, {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Edit Data Absensi</h1>
      <p className="text-gray-600 mb-6">Ubah data absensi siswa sesuai kebutuhan</p>

      <FormEdit
        initialValues={initialValues}
        userOptions={userOptions}
        mapelOptions={mapelOptions}
        kelasOptions={kelasOptions}
        onSubmit={handleSubmit}
        submitLabel="Update Data"
      />
    </div>
  )
}

Edit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
