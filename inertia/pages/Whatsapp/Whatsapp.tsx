import React, { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useNotification } from '~/Components/NotificationAlert'
import { getSocket } from '~/socket/whasappSocket'
import SuperAdminLayout from '~/Layouts/SuperAdminLayouts'

interface WhatsAppStatus {
  isReady: boolean
  isInitializing: boolean
  hasQrCode: boolean
  qrCode: string | null
}

export default function WhatsAppConnection() {
  const { notify } = useNotification()
  const [status, setStatus] = useState<WhatsAppStatus>({
    isReady: false,
    isInitializing: false,
    hasQrCode: false,
    qrCode: null,
  })
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const socket = getSocket()

    // Setup WhatsApp listeners
    socket.on('whatsapp_status', (message: string) => {
      addLog(`Status: ${message}`)
      notify(message, 'info')
    })

    socket.on('whatsapp_qr', (qrCode: string) => {
      setStatus((prev) => ({ ...prev, hasQrCode: true, qrCode }))
      addLog('QR Code received - Please scan with WhatsApp')
      notify('QR Code received! Please scan with WhatsApp', 'success')
    })

    socket.on('whatsapp_error', (error: string) => {
      addLog(`Error: ${error}`)
      notify(error, 'error')
    })

    socket.on('whatsapp_message', (message: string) => {
      addLog(`Message: ${message}`)
    })

    // Get initial status
    socket.emit('whatsapp_get_status')

    // Listen for status updates
    socket.on('whatsapp_status_update', (statusData: WhatsAppStatus) => {
      setStatus(statusData)
    })

    return () => {
      // Cleanup listeners
      socket.off('whatsapp_status')
      socket.off('whatsapp_qr')
      socket.off('whatsapp_error')
      socket.off('whatsapp_message')
      socket.off('whatsapp_status_update')
    }
  }, [])

  const handleInitialize = () => {
    const socket = getSocket()
    socket.emit('whatsapp_initialize')
    setStatus((prev) => ({ ...prev, isInitializing: true }))
    addLog('Initializing WhatsApp client...')
  }

  const handleGetQR = () => {
    const socket = getSocket()
    socket.emit('whatsapp_get_qr')
    addLog('Requesting QR code...')
  }

  const handleDestroy = () => {
    const socket = getSocket()
    socket.emit('whatsapp_destroy')
    setStatus({
      isReady: false,
      isInitializing: false,
      hasQrCode: false,
      qrCode: null,
    })
    addLog('WhatsApp client destroyed')
    notify('WhatsApp client destroyed', 'warning')
  }

  const handleGetStatus = () => {
    const socket = getSocket()
    socket.emit('whatsapp_get_status')
    addLog('Checking status...')
  }

  return (
    <div className={`mx-auto lg:p-6 max-w-7xl`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">WhatsApp Connection</h1>
        </div>

        {/* Status Card */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Connection Status
              </h2>
              <p
                className={`text-sm ${status.isReady ? 'text-green-600' : status.isInitializing ? 'text-yellow-600' : 'text-red-600'}`}
              >
                {status.isReady
                  ? '✅ Connected'
                  : status.isInitializing
                    ? '🔄 Initializing...'
                    : '❌ Disconnected'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGetStatus}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
              >
                Refresh Status
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button
            onClick={handleInitialize}
            disabled={status.isInitializing || status.isReady}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {status.isInitializing ? 'Initializing...' : 'Initialize'}
          </button>

          <button
            onClick={handleGetQR}
            disabled={!status.isInitializing && !status.hasQrCode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Get QR Code
          </button>

          <button
            onClick={handleDestroy}
            disabled={!status.isReady && !status.isInitializing}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            Destroy
          </button>

          <button
            onClick={() => setLogs([])}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Clear Logs
          </button>
        </div>

        {/* QR Code Section */}
        {status.hasQrCode && status.qrCode && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6 mb-6 text-center">
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-4">
              Scan QR Code with WhatsApp
            </h3>
            <div className="flex justify-center">
              <QRCodeSVG
                value={status.qrCode}
                size={256}
                level="H"
                className="border-4 border-white shadow-lg"
              />
            </div>
            <p className="text-yellow-700 dark:text-yellow-400 mt-4">
              Open WhatsApp → Settings → Linked Devices → Link a Device
            </p>
          </div>
        )}

        {/* Connection Steps */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
            Connection Steps:
          </h3>
          <ol className="list-decimal list-inside text-blue-700 dark:text-blue-200 space-y-1">
            <li>Click "Initialize" to start WhatsApp client</li>
            <li>Click "Get QR Code" to generate QR code</li>
            <li>Open WhatsApp and scan the QR code</li>
            <li>Wait for "WhatsApp siap!" status</li>
            <li>You can now send messages!</li>
          </ol>
        </div>

        {/* Logs Section */}
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Connection Logs</h3>
          <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-sm text-green-400">
            {logs.length === 0 ? (
              <div className="text-gray-500">No logs yet. Initialize WhatsApp to see logs.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-b border-gray-700 py-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

WhatsAppConnection.layout = (page: any) => {
  return <SuperAdminLayout>{page}</SuperAdminLayout>
}
