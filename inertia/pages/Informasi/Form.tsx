import React, { useEffect, useState } from 'react'
import { router, useForm } from '@inertiajs/react'
import UniversalInput from '~/Components/UniversalInput'
import { Informasi } from './types'
import StafLayout from '~/Layouts/StafLayouts'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { getSocket } from '~/socket/whasappSocket'
import { useNotification } from '~/Components/NotificationAlert'

interface Props {
  initialValues?: Informasi
  onSubmit: (data: Informasi) => void
  submitLabel: string
  dark?: boolean
  dataKontak?: any[]
}

interface Contact {
  fullName: string
  noTelephone: string
  role: string
}

export default function Form({
  initialValues,
  onSubmit,
  submitLabel,
  dark = false,
  dataKontak,
}: Props) {
  const { data, setData, post, processing, errors } = useForm<Informasi>(
    initialValues || {
      judul: '',
      deskripsi: '',
      roleTujuan: '',
      publishAt: '',
      closeAt: '',
    }
  )

  const [sendWhatsapp, setSendWhatsapp] = useState(false)

  const [kontakSelected, setKontakSelected] = useState<any[]>([])

  const socket = getSocket()

  const { notify } = useNotification()
  useEffect(() => {
    socket.on('whatsapp_status', (data: any) => {
      notify(`${data.message}`, 'info')
      console.log('🟢', data.message)
    })

    return () => {
      socket.off('user_joined')
    }
  }, [])

  const roleOptions = [
    { label: 'Siswa', value: 'siswa' },
    { label: 'Guru', value: 'guru' },
    { label: 'Semua', value: 'semua' },
  ]

  const dataFiltered = dataKontak?.filter((item) => {
    if (data.roleTujuan != 'semua') {
      return item.role.toLowerCase() == data.roleTujuan.toLowerCase()
    }

    return item
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (sendWhatsapp) {
      const payload = {
        numbers: kontakSelected,
        message: `*PENGUMUMAN!!*\n${data.judul}\n\n${data.deskripsi}`,
      }
      router.post('/api/whatsapp/bulk-send', payload, {
        onSuccess: () => onSubmit(data),
      })
    } else {
      onSubmit(data)
    }
  }

  const handleSelectUser = (checked: boolean, data: Contact) => {
    if (checked) {
      setKontakSelected((prev) => [...prev, data.noTelephone])
    } else {
      setKontakSelected((prev) => prev.filter((item) => item !== data.noTelephone))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4">
        <UniversalInput
          type="text"
          name="judul"
          label="Judul Informasi"
          value={data.judul}
          onChange={(v: any) => setData('judul', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="textarea"
          name="deskripsi"
          label="Deskripsi"
          value={data.deskripsi}
          onChange={(v: any) => setData('deskripsi', v)}
          required
          dark={dark}
        />

        <UniversalInput
          type="select"
          name="roleTujuan"
          label="Role Tujuan"
          value={data.roleTujuan}
          onChange={(v: any) => setData('roleTujuan', v)}
          options={roleOptions}
          required
          dark={dark}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UniversalInput
            type="datetime-local"
            name="publishAt"
            label="Publish At"
            value={data.publishAt}
            onChange={(v: any) => setData('publishAt', v)}
            required
            dark={dark}
          />

          <UniversalInput
            type="datetime-local"
            name="closeAt"
            label="Close At"
            value={data.closeAt}
            onChange={(v: any) => setData('closeAt', v)}
            required
            dark={dark}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={processing}
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {processing ? 'Menyimpan...' : submitLabel}
        </button>
      </div>

      <UniversalInput
        type="checkbox"
        name="whatsapp"
        label="Kirim Juga Ke Whatsapp"
        value={sendWhatsapp}
        onChange={(v: any) => setSendWhatsapp(v)}
        dark={dark}
      />
      {sendWhatsapp && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                router.post('/api/whatsapp/initialize')
              }}
              type="button"
              className="bg-green-600 px-2 py-1 rounded-md text-white"
            >
              Inisiasi Whatsapp
            </button>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="PilihSemua"
                onChange={(e) => {
                  dataFiltered?.map((item) => handleSelectUser(e.target.checked, item))
                }}
              />
              <label htmlFor="PilihSemua" className="font-medium text-gray-800 dark:text-white">
                Pilih Semua
              </label>
            </div>
          </div>
          {dataFiltered?.map((item, index) => (
            <label
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 flex items-center gap-3">
                  <span>{item.fullName}</span>
                  <span className="bg-gray-300 dark:bg-gray-500 rounded-full px-2 py-1 text-xs">
                    {item.role}
                  </span>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.noTelephone}</p>
              </div>
              <input
                type="checkbox"
                value={item}
                checked={kontakSelected.includes(item.noTelephone)}
                onChange={(e) => handleSelectUser(e.target.checked, item)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </label>
          ))}
        </div>
      )}
    </form>
  )
}

Form.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
