// resources/js/Pages/absensi_wali_kelas/Create.tsx
import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import Form from './Form'
import GuruLayout from '~/Layouts/GuruLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create({ accessibleKelas, today, flashMessages }: any) {
  const { props } = usePage()
  const pattern = String(props.pattern)
    .split('/')
    .filter((item) => item != '')
  const pathPattern = `${pattern[0]}/${pattern[1]}/${pattern[2]}`

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.post(pathPattern, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(`/${pattern[0] + '/' + pattern[1]}`)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
      onError: (errors) => {
        console.error('Error creating absensi:', errors)
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tambah Absensi Wali Kelas
      </h1>
      <Form
        accessibleKelas={accessibleKelas}
        today={today}
        onSubmit={handleSubmit}
        submitLabel="Simpan Absensi"
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
