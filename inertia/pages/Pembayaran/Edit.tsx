import { router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import FormEdit from './FormEdit'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { PembayaranItem } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

export default function Edit({ pembayaran, users, jenisPembayaranOptions }: any) {
  const initialValues: PembayaranItem = {
    id: pembayaran.id,
    userId: pembayaran.userId,
    jenisPembayaran: pembayaran.jenisPembayaran,
    nominalPenetapan: pembayaran.nominalPenetapan,
    nominalBayar: pembayaran.nominalBayar,
    userName: pembayaran.userName,
    totalDibayar: pembayaran.totalDibayar,
    sisaPembayaran: pembayaran.sisaPembayaran,
    lunas: pembayaran.lunas,
    riwayatPembayaran: pembayaran.riwayatPembayaran,
    createdAt: pembayaran.createdAt,
    updatedAt: pembayaran.updatedAt,
  }

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const userOptions = users.map((item: any) => {
    return { label: item.fullName, value: item.id }
  })

  const { notify } = useNotification()
  const handleSubmit = (data: PembayaranItem) => {
    router.put(`${url}/${pembayaran.id}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
      onError: (errors) => {
        console.error('Error updating pembayaran:', errors)
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Edit Data Pembayaran
      </h1>
      <p className="text-gray-600 mb-6">Kelola data pembayaran dan tambahkan pembayaran baru</p>

      <FormEdit
        initialValues={initialValues}
        userOptions={userOptions}
        jenisPembayaranOptions={jenisPembayaranOptions}
        onSubmit={handleSubmit}
        submitLabel="Update Data"
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
