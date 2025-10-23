export function timeFormat(
  isoString: string,
  options?: {
    mode?: 'date' | 'time' | 'datetime'
    withDay?: boolean
  }
): string {
  const { mode = 'datetime', withDay = false } = options || {}

  const date = new Date(isoString)

  // Opsi tanggal
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  if (withDay) {
    dateOptions.weekday = 'long'
  }

  // Format waktu manual biar pakai ":"
  const getTimeString = (d: Date) => {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    const s = d.getSeconds().toString().padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  let formatted = ''

  if (!isoString) {
    return '-'
  }
  switch (mode) {
    case 'date':
      formatted = new Intl.DateTimeFormat('id-ID', dateOptions)?.format(date)
      break
    case 'time':
      formatted = getTimeString(date)
      break
    case 'datetime':
      const d = new Intl.DateTimeFormat('id-ID', dateOptions)?.format(date)
      const t = getTimeString(date)
      formatted = `${d} ${t}`
      break
    default:
      formatted = `${new Intl.DateTimeFormat('id-ID', dateOptions)?.format(
        date
      )} ${getTimeString(date)}`
  }

  return formatted
}

export function FormInputDateFormat(date: any) {
  if (date.includes('T') || date.includes(' ')) {
    const d = new Date(date)
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0') // bulan mulai dari 0
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  }

  return date
}

export function formatDateTimeLocal(input: any) {
  if (!input) return ''

  const date = new Date(input)

  // Format: YYYY-MM-DDTHH:mm (local time)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
