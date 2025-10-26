// resources/js/Pages/absensi_wali_kelas/Edit.tsx
import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import FormEdit from './FormEdit'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ absensi, users, accessibleKelas }: any) {
  const initialValues = {
    id: absensi.id,
    userId: absensi.userId,
    kelasId: absensi.kelasId,
    status: absensi.status,
    hari: absensi.hari,
    userName: absensi.userName,
    kelasName: absensi.kelasName,
  }

  const { props } = usePage()
  const pattern = String(props.pattern)
    .split('/')
    .filter((item) => item != '')
  const pathPattern = `${pattern[0]}/${pattern[1]}/${pattern[2]}`

  const userOptions = users.map((item: any) => ({
    label: item.fullName,
    value: item.id,
  }))

  const kelasOptions = accessibleKelas.map((item: any) => ({
    label: item.namaKelas,
    value: item.id,
  }))

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.put(`${pathPattern}${absensi.id}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(pathPattern)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
      onError: (errors) => {
        console.error('Error updating absensi:', errors)
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Edit Data Absensi Wali Kelas
      </h1>
      <p className="text-gray-600 mb-6">Ubah data absensi siswa sesuai kebutuhan</p>

      <FormEdit
        initialValues={initialValues}
        userOptions={userOptions}
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
