// resources/js/Pages/Siswa/Create.tsx

import { router, usePage } from '@inertiajs/react'
import SiswaForm from './Form'
import { SiswaFormData } from './types'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function SiswaCreate() {
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
      onError: (errors) => {
        console.log('Validation errors:', errors)
      },
      preserveState: true,
      preserveScroll: true,
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Tambah Siswa Baru</h1>
      <SiswaForm onSubmit={handleSubmit} submitLabel="Simpan" />
    </div>
  )
}

SiswaCreate.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
