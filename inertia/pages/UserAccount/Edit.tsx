// resources/js/Pages/UserAccount/Edit.tsx
import React from 'react'
import { Head, useForm, router, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import SiswaLayout from '~/Layouts/SiswaLayouts'
import { useNotification } from '~/Components/NotificationAlert'
import UniversalInput from '~/Components/UniversalInput'

export default function UserAccountEdit({ auth, user, profile }: any) {
  const { data, setData, put, processing, errors } = useForm({
    fullName: user.fullName || '',
    email: user.email || '',
    password: '',

    // Field umum
    alamat: profile?.alamat || '',
    noTelepon: profile?.noTelepon || '',
    jenisKelamin: profile?.jenisKelamin || 'Laki-laki',
    tempatLahir: profile?.tempatLahir || '',
    tanggalLahir: profile?.tanggalLahir
      ? new Date(profile.tanggalLahir).toISOString().split('T')[0]
      : '',
    agama: profile?.agama || '',

    // Field khusus Guru/Staf
    gelarDepan: profile?.gelarDepan || '',
    gelarBelakang: profile?.gelarBelakang || '',
  })

  const { props } = usePage()
  const pattern = (props?.pattern as string).split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const { notify } = useNotification()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`${url}/update`, {
      preserveScroll: true,
      onSuccess: ({ props }: any) => {
        if (props.session.status == 'success') {
          router.visit(url)
        }

        props.session.error.messages.map((m: any) => notify(m.message, 'error'))
      },
    })
  }

  const isGuruOrStaf = user.role === 'Guru' || user.role === 'Staf'

  return (
    <div className="max-w-6xl mx-auto lg:p-6">
      <Head title="Edit Profile" />
      <Notification />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Perbarui informasi akun dan data pribadi
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Informasi Akun */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
              Informasi Akun
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalInput
                name="fullName"
                label="Nama Lengkap"
                required
                placeholder="Nama Lengkap"
                type="text"
                value={data.fullName}
                onChange={(e) => {
                  setData('fullName', e)
                }}
              />

              <UniversalInput
                name="email"
                label="Email"
                required
                placeholder="Email"
                type="email"
                value={data.email}
                onChange={(e) => {
                  setData('email', e)
                }}
              />

              <UniversalInput
                name="password"
                label="Password Baru"
                placeholder="Password Baru"
                type="password"
                value={data.password}
                onChange={(e) => {
                  setData('password', e)
                }}
              />
            </div>
          </div>

          {user.role != 'SuperAdmin' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Informasi Pribadi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UniversalInput
                  name="jenisKelamin"
                  label="Jenis Kelamin"
                  required
                  placeholder="Jenis Kelamin"
                  type="select"
                  options={[
                    { label: 'Laki-laki', value: 'Laki-laki' },
                    { label: 'Perempuan', value: 'Perempuan' },
                  ]}
                  value={data.jenisKelamin}
                  onChange={(e) => {
                    setData('jenisKelamin', e)
                  }}
                />

                <UniversalInput
                  name="agama"
                  label="Agama"
                  required
                  placeholder="Agama"
                  type="select"
                  options={[
                    { label: 'Laki-laki', value: 'Laki-laki' },
                    { label: 'Perempuan', value: 'Perempuan' },
                  ]}
                  value={data.agama}
                  onChange={(e) => {
                    setData('agama', e)
                  }}
                />

                <UniversalInput
                  name="tempatLahir"
                  label="Tempat Lahir"
                  required
                  placeholder="Tempat Lahir"
                  type="text"
                  value={data.tempatLahir}
                  onChange={(e) => {
                    setData('tempatLahir', e)
                  }}
                />

                <UniversalInput
                  name="tanggalLahir"
                  label="Tanggal Lahir"
                  required
                  placeholder="Tanggal Lahir"
                  type="date"
                  value={data.tanggalLahir}
                  onChange={(e) => {
                    setData('tanggalLahir', e)
                  }}
                />

                <UniversalInput
                  name="noTelepon"
                  label="No. Telepon"
                  required
                  placeholder="No. Telepon"
                  type="number"
                  value={data.noTelepon}
                  onChange={(e) => {
                    setData('noTelepon', e)
                  }}
                />

                {isGuruOrStaf && (
                  <>
                    <UniversalInput
                      name="gelarDepan"
                      label="Gelar Depan"
                      placeholder="Gelar Depan"
                      type="text"
                      value={data.gelarDepan}
                      onChange={(e) => {
                        setData('gelarDepan', e)
                      }}
                    />

                    <UniversalInput
                      name="gelarBelakang"
                      label="Gelar Belakang"
                      placeholder="Gelar Belakang"
                      type="text"
                      value={data.gelarBelakang}
                      onChange={(e) => {
                        setData('gelarBelakang', e)
                      }}
                    />
                  </>
                )}
              </div>

              <div>
                <label
                  htmlFor="alamat"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Alamat
                </label>
                <textarea
                  id="alamat"
                  value={data.alamat}
                  onChange={(e) => setData('alamat', e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => router.visit(url)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

UserAccountEdit.layout = (page: any) => {
  const user = page.props.user

  switch (user.role) {
    case 'Guru':
      return <GuruLayout>{page}</GuruLayout>
    case 'Staf':
      return <StafLayout>{page}</StafLayout>
    case 'Siswa':
      return <SiswaLayout>{page}</SiswaLayout>
    default:
      return <SuperAdminLayout>{page}</SuperAdminLayout>
  }
}
