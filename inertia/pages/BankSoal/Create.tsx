// resources/js/Pages/BankSoal/Create.tsx
import { router, usePage } from '@inertiajs/react'
import BankSoalForm from './Form'
import { JurusanOption, UserOption } from './types'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

interface CreateProps {
  jurusanList: JurusanOption[]
  usersList: UserOption[]
  mapelList: any[]
}

export default function BankSoalCreate({ jurusanList, usersList, mapelList }: CreateProps) {
  const guruOptions = usersList.map((item: any) => {
    return { label: item.fullName, value: item.id }
  })

  const mapelOptions = mapelList.map((item: any) => {
    return { label: `${item.namaMataPelajaran}(${item.jenjang})`, value: item.id }
  })

  const props = usePage()
  const userRole = props.url.split('/').filter((item) => item != '')?.[0]

  const { notify } = useNotification()
  const handleSubmit = (data: any) => {
    router.post(`/${userRole}/bank-soal`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(`/${userRole}/bank-soal`)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Tambah Bank Soal Baru
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BankSoalForm
          mapelOptions={mapelOptions}
          guruOptions={guruOptions}
          onSubmit={handleSubmit}
          submitLabel="Simpan"
          jurusanList={jurusanList}
        />
      </div>
    </div>
  )
}
BankSoalCreate.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
