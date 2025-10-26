import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import Form from './Form'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { Mapel } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ mapel, dataGuru }: any) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const initialValues: Mapel = {
    namaMataPelajaran: mapel.namaMataPelajaran,
    jenjang: mapel.jenjang,
    guruAmpu: Array.isArray(mapel.guruAmpu) ? mapel.guruAmpu : [String(mapel.guruAmpu)],
  }

  const guruOptions = dataGuru.map((item: any) => {
    return { label: item.user.fullName, value: item.nip }
  })

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.put(`${url}/${mapel.id}`, data, {
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
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Mata Pelajaran</h1>
      <Form
        initialValues={initialValues}
        guruOptions={guruOptions}
        onSubmit={handleSubmit}
        submitLabel="Update"
      />
    </div>
  )
}

Edit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
