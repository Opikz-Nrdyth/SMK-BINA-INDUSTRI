// resources/js/Pages/BankSoal/Edit.tsx
import { router, usePage } from '@inertiajs/react'
import BankSoalForm from './Form'
import { BankSoal, BankSoalFormData, JurusanOption, UserOption } from './types'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import { useNotification } from '~/Components/NotificationAlert'

interface EditProps {
  bankSoal: BankSoal
  jurusanList: JurusanOption[]
  usersList: UserOption[]
}

export default function BankSoalEdit({ bankSoal, jurusanList, usersList, mapelList }: EditProps) {
  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`
  const { notify } = useNotification()
  const handleSubmit = (data: BankSoalFormData) => {
    router.put(`${url}/${bankSoal.id}`, data, {
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  const userOptions = usersList.map((item: any) => {
    return { label: item.fullName, value: item.id }
  })

  const mapelOptions = mapelList.map((item: any) => {
    return { label: item.namaMataPelajaran, value: item.id }
  })

  const initialValues: BankSoalFormData & { id: string } = {
    id: bankSoal.id,
    namaUjian: bankSoal.namaUjian,
    jenjang: bankSoal.jenjang,
    jurusan: bankSoal.jurusan,
    mapel: bankSoal.mapelId,
    kode: bankSoal.kode,
    jenisUjian: bankSoal.jenisUjian,
    penulis: bankSoal.penulis,
    waktu: bankSoal.waktu,
    tanggalUjian: bankSoal.tanggalUjian,
    soalFile: bankSoal.soalFile, // Note: This will need decryption in real implementation
  }

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Notification />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Edit Bank Soal: {bankSoal.namaUjian}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <BankSoalForm
          guruOptions={userOptions}
          initialValues={initialValues}
          onSubmit={handleSubmit}
          submitLabel="Update"
          jurusanList={jurusanList}
          mapelOptions={mapelOptions}
        />
      </div>
    </div>
  )
}

BankSoalEdit.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
