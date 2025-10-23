import { useEffect, useState } from 'react'

interface WhatsappMessagePopupProps {
  row: any
  onClose: () => void
  onSend: (message: string) => void
}
export default function WhatsappMessagePopup({ row, onClose, onSend }: WhatsappMessagePopupProps) {
  const [message, setMessage] = useState(
    'Hallo {siswa}, Anda masih punya tunggakan {jenisPembayaran} senilai {sisaPembayaran}'
  )

  const variables = [
    { label: 'Nama Siswa', key: '{siswa}' },
    { label: 'Jenis Pembayaran', key: '{jenisPembayaran}' },
    { label: 'Sisa Pembayaran', key: '{sisaPembayaran}' },
  ]

  const insertAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById('messageBox') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newValue = message.substring(0, start) + textToInsert + message.substring(end)
    setMessage(newValue)
    setTimeout(() => {
      textarea.focus()
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length
    }, 0)
  }

  const formatText = (symbol: string) => {
    const textarea = document.getElementById('messageBox') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = message.substring(start, end)
    const newValue =
      message.substring(0, start) + symbol + selected + symbol + message.substring(end)
    setMessage(newValue)
  }

  const handleSend = () => {
    const finalMsg = message
      .replace('{siswa}', row.siswa)
      .replace('{jenisPembayaran}', row.jenisPembayaran)
      .replace('{sisaPembayaran}', row.sisaPembayaran)

    localStorage.setItem('messagePesan', message)
    onSend(finalMsg)
  }

  useEffect(() => {
    if (localStorage.messagePesan) {
      setMessage(localStorage.messagePesan)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
          Buat Pesan WhatsApp
        </h2>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => formatText('*')}
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <b>B</b>
          </button>
          <button
            onClick={() => formatText('_')}
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 italic"
          >
            I
          </button>
          <button
            onClick={() => formatText('~')}
            className="px-3 py-1 border rounded hover:bg-gray-100 dark:hover:bg-gray-700 line-through"
          >
            S
          </button>

          {/* Variable Insert */}
          {variables.map((v) => (
            <button
              key={v.key}
              onClick={() => insertAtCursor(v.key)}
              className="px-3 py-1 border rounded text-sm bg-blue-50 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100"
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          id="messageBox"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          className="w-full border rounded-lg p-3 text-sm dark:bg-gray-900 dark:text-gray-100"
          placeholder="Tulis pesan di sini..."
        />

        {/* Actions */}
        <div className="flex justify-end mt-4 gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Batal
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  )
}
