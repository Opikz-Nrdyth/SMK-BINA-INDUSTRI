// resources/js/Pages/Blog/Edit.tsx
import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Blog } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ blog }: { blog: Blog }) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const initialValues: Blog = {
    ...blog,
    tags: blog.tags || [],
  }

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.put(`${url}/${blog.id}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Blog: {blog.judul}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Perbarui konten blog Anda</p>
      </div>
      <Form initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Update Blog" />
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
