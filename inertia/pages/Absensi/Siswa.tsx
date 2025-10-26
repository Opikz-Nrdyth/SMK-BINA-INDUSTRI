import { useEffect, useState } from 'react'
import { timeFormat } from '~/Components/FormatWaktu'
import { Notification } from '~/Components/Notification'
import DataTable from '~/Components/TabelData'
import GuruLayout from '~/Layouts/GuruLayouts'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

export default function Siswa({ absensiPaginate, absensi, flashMessages }: any) {
  const [data, setData] = useState([])
  const [dataSelected, setDataSelected] = useState<any | null>()
  const [siswaName, setSiswaName] = useState({
    nama: null,
    kelas: null,
  })

  useEffect(() => {
    if (!absensi) return

    const newData = [] as any
    absensi?.forEach((item: any) => {
      newData.push({
        id: item.id,
        siswa: item.userName,
        mataPelajaran: item.mapelName,
        kelas: item.kelasName,
        status: item.status,
        hari: item.hari ? timeFormat(item.hari, { mode: 'date', withDay: true }) : '-',
        createdAt: item.createdAt,
        userId: item.userId,
        mapelId: item.mapelId,
        kelasId: item.kelasId,
        syncStatus: 'synced',
      })

      setSiswaName({
        nama: item.userName,
        kelas: item.kelasName,
      })
    })
    setData(newData)
  }, [absensi])

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Notification />
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Absensi</h1>
        <div
          className={`mt-2 text-purple-500 font-bold`}
        >{`${siswaName.nama} | ${siswaName.kelas}`}</div>
      </div>
      <DataTable
        data={data}
        columns={[
          { header: 'Siswa', accessor: 'siswa' as const },
          { header: 'Mata Pelajaran', accessor: 'mataPelajaran' as const },
          { header: 'Kelas', accessor: 'kelas' as const },
          {
            header: 'Status',
            accessor: 'status' as const,
          },
          { header: 'Hari', accessor: 'hari' as const },
        ]}
        pageSize={10}
        placeholder="Cari absensi..."
        noDataText="Tidak ada data absensi"
        onRowClick={(value: any) => setDataSelected(value)}
      />
    </div>
  )
}

Siswa.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Guru') {
    return <GuruLayout>{page}</GuruLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
