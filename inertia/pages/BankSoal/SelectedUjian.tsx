import { Head, useForm, Link, usePage, router } from '@inertiajs/react'
import { PageProps } from '@/types'
import Layout from '@/Layouts/Layout'
import { useState } from 'react'
import StafLayout from '~/Layouts/StafLayouts'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'
import { useNotification } from '~/Components/NotificationAlert'

interface SoalItem {
  id: string
  soal: string
  A: string
  B: string
  C: string
  D: string
  E: string
  kunci: string
  selected?: boolean
}

interface BankSoal {
  id: number
  namaUjian: string
  kode: string
  jenjang: string
  jenisUjian: string
  soalFile?: string
}

interface Props extends PageProps {
  bankSoal: BankSoal
  soalContent: SoalItem[]
}

export default function SelectedUjian({ bankSoal, soalContent }: Props) {
  const [soals, setSoals] = useState<SoalItem[]>(soalContent)
  const [saving, setSaving] = useState(false)
  const { post, processing } = useForm()

  const { props } = usePage()
  const pattern = props?.pattern.split('/').filter((item: any) => item != '')
  const url = `/${pattern[0]}/${pattern[1]}`

  const toggleSelected = (soalId: string) => {
    setSoals((prevSoals) =>
      prevSoals.map((soal) => (soal.id === soalId ? { ...soal, selected: !soal.selected } : soal))
    )
  }

  const selectAll = () => {
    setSoals((prevSoals) => prevSoals.map((soal) => ({ ...soal, selected: true })))
  }

  const { notify } = useNotification()

  const unselectAll = () => {
    setSoals((prevSoals) => prevSoals.map((soal) => ({ ...soal, selected: false })))
  }

  const saveSelected = async () => {
    setSaving(true)

    try {
      await router.put(
        `${url}/${bankSoal.id}/update-soal`,
        {
          soalContent: soals,
        },
        {
          onSuccess: () => {
            setSaving(false)
          },
        }
      )
    } catch (error) {
      notify('Error Pada Sistem', 'error')
      console.log(error)
    }
  }

  const selectedCount = soals.filter((soal) => soal.selected).length
  const totalSoal = soals.length

  return (
    <>
      <Head title={`Selected Ujian - ${bankSoal.namaUjian}`} />

      <div className="px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Selected Ujian - {bankSoal.namaUjian}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Jenjang: {bankSoal.jenjang} | Jenis: {bankSoal.jenisUjian}
            </p>
          </div>
          <Link
            href={url}
            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Kembali
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="ml-4 text-gray-900 dark:text-white">
                <h3 className="text-sm font-medium">Total Soal</h3>
                <p className="text-2xl font-bold">{totalSoal}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4 text-gray-900 dark:text-white">
                <h3 className="text-sm font-medium">Selected</h3>
                <p className="text-2xl font-bold ">{selectedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="w-8 h-8 text-yellow-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4 text-gray-900 dark:text-white">
                <h3 className="text-sm font-medium">Belum Selected</h3>
                <p className="text-2xl font-bold">{totalSoal - selectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow rounded-lg">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Daftar Soal
              </h3>
              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                <button
                  onClick={selectAll}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Select All
                </button>
                <button
                  onClick={unselectAll}
                  disabled={processing}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:text-white dark:bg-gray-700 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Unselect All
                </button>
                <button
                  onClick={saveSelected}
                  disabled={processing || saving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Simpan Selected
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 dark:bg-gray-900">
            {soals.length === 0 ? (
              <div className="text-center py-8">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 "
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Tidak ada soal
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                  Tidak ada soal tersedia untuk ujian ini.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-900">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-white">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-12"
                      >
                        No
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider w-20"
                      >
                        Selected
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                      >
                        Soal
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-24"
                      >
                        Kunci
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider w-32"
                      >
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {soals.map((soal, index) => (
                      <tr
                        key={soal.id}
                        className={
                          soal.selected
                            ? 'bg-green-50 dark:bg-slate-700 hover:bg-green-100 hover:dark:bg-slate-800'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700'
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={soal.selected || false}
                            onChange={() => toggleSelected(soal.id)}
                            disabled={processing}
                            className="h-4 w-4 text-indigo-600  focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white max-h-20 overflow-auto scrollbar-thin scrollbar-thumb-purple ">
                            <p dangerouslySetInnerHTML={{ __html: soal.soal }} />
                            <div className="flex flex-wrap gap-1 text-gray-900">
                              <p
                                className={`${soal.selected ? 'bg-purple-200' : 'bg-gray-200'} px-2 py-1 text-xs rounded-lg flex gap-1`}
                              >
                                A. <div dangerouslySetInnerHTML={{ __html: soal.A }}></div>
                              </p>
                              <p
                                className={`${soal.selected ? 'bg-purple-200' : 'bg-gray-200'} px-2 py-1 text-xs rounded-lg flex gap-1`}
                              >
                                B. <div dangerouslySetInnerHTML={{ __html: soal.B }}></div>
                              </p>
                              <p
                                className={`${soal.selected ? 'bg-purple-200' : 'bg-gray-200'} px-2 py-1 text-xs rounded-lg flex gap-1`}
                              >
                                C. <div dangerouslySetInnerHTML={{ __html: soal.C }}></div>
                              </p>
                              <p
                                className={`${soal.selected ? 'bg-purple-200' : 'bg-gray-200'} px-2 py-1 text-xs rounded-lg flex gap-1`}
                              >
                                D. <div dangerouslySetInnerHTML={{ __html: soal.D }}></div>
                              </p>
                              <p
                                className={`${soal.selected ? 'bg-purple-200' : 'bg-gray-200'} px-2 py-1 text-xs rounded-lg flex gap-1`}
                              >
                                E. <div dangerouslySetInnerHTML={{ __html: soal.E }}></div>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {soal.kunci}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => toggleSelected(soal.id)}
                            disabled={processing}
                            className={`inline-flex items-center px-3 py-1 border text-sm font-medium rounded-md ${
                              soal.selected
                                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                                : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                            } disabled:opacity-50`}
                          >
                            {soal.selected ? (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                  />
                                </svg>
                                Unselect
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                                Select
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

SelectedUjian.layout = (page: any) => {
  const activeRole = page.props.activeRole ?? page.props.user.role
  if (activeRole == 'Staf') {
    return <StafLayout>{page}</StafLayout>
  }

  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
