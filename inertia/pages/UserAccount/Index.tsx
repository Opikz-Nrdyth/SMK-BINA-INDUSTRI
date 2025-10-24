import { Head, Link, usePage } from '@inertiajs/react'
import { Notification } from '~/Components/Notification'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import GuruLayout from '~/Layouts/GuruLayouts'
import StafLayout from '~/Layouts/StafLayouts'
import SiswaLayout from '~/Layouts/SiswaLayouts'

export default function UserAccountIndex({ auth, user, profile }: any) {
  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      SuperAdmin: 'Super Admin',
      Staf: 'Staf',
      Guru: 'Guru',
      Siswa: 'Siswa',
    }
    return roleMap[role] || role
  }

  const getIdentifier = () => {
    switch (user.role) {
      case 'Siswa':
        return { label: 'NISN', value: profile?.nisn }
      case 'Guru':
        return { label: 'NIP', value: profile?.nip }
      case 'Staf':
        return { label: 'NIP', value: profile?.nip }
      default:
        return { label: 'ID', value: user.id }
    }
  }

  const identifier = getIdentifier()

  return (
    <div className="max-w-7xl mx-auto lg:p-6">
      <Head title="Profile Saya" />
      <Notification />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Saya</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Informasi akun dan data pribadi
              </p>
            </div>
            {props.editProfile ? (
              <Link
                href={`${url}/edit`}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
              >
                Edit Profile
              </Link>
            ) : null}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Akun */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                Informasi Akun
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Nama Lengkap
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.fullName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {getRoleDisplay(user.role)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                    {identifier.label}
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {identifier.value || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informasi Pribadi */}
            {user?.role != 'SuperAdmin' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b pb-2">
                  Informasi Pribadi
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Jenis Kelamin
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.jenisKelamin || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Tempat, Tanggal Lahir
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.tempatLahir
                        ? `${profile.tempatLahir}, ${formatDate(profile.tanggalLahir)}`
                        : '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      Agama
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.agama || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                      No. Telepon
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {profile?.noTelepon || '-'}
                    </p>
                  </div>

                  {(profile?.gelarDepan || profile?.gelarBelakang) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                        Gelar
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-white">
                        {[profile.gelarDepan, profile.gelarBelakang].filter(Boolean).join(' ') ||
                          '-'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Alamat */}
          {profile?.alamat && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Alamat</h2>
              <p className="text-sm text-gray-900 dark:text-white">{profile.alamat}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

UserAccountIndex.layout = (page: any) => {
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
