// resources/js/Pages/Blog/Create.tsx
import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import Form from './Form'
import StafLayout from '~/Layouts/StafLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Create({ defaultValues }: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.post(url, data, {
      onSuccess: ({ props }: any) => {
        if (props?.session?.status == 'success') {
          router.visit(url)
        }

        props?.session?.error?.messages?.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tambah Blog Baru</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Buat konten blog yang menarik dan informatif
        </p>
      </div>
      <Form initialValues={defaultValues} onSubmit={handleSubmit} submitLabel="Simpan Blog" />
    </div>
  )
}

Create.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole === 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
