// resources/js/services/UjianStorageService.ts
class UjianStorageService {
  private dbName = 'UjianDB'
  private version = 2
  private isSupported: boolean = false

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'indexedDB' in window
  }

  async init(): Promise<IDBDatabase> {
    if (!this.isSupported) {
      throw new Error('IndexedDB is not supported in this environment')
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result

        // Create object store untuk jawaban
        if (!db.objectStoreNames.contains('jawaban')) {
          const store = db.createObjectStore('jawaban', {
            keyPath: ['ujianId', 'soalId'],
          })
          store.createIndex('ujianId', 'ujianId', { unique: false })
          store.createIndex('soalId', 'soalId', { unique: false })
        }

        // Create object store untuk status ujian
        if (!db.objectStoreNames.contains('ujian_status')) {
          db.createObjectStore('ujian_status', {
            keyPath: 'ujianId',
          })
        }
      }
    })
  }

  // Simpan jawaban untuk soal tertentu
  async simpanJawaban(ujianId: string, soalId: string, jawaban: string): Promise<void> {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported, skipping offline storage')
      return
    }

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jawaban'], 'readwrite')
        const store = transaction.objectStore('jawaban')

        const record = {
          ujianId,
          soalId,
          jawaban,
          timestamp: new Date().toISOString(),
          syncStatus: 'pending' as const,
        }

        store.put(record)

        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
    } catch (error) {
      console.error('Error saving jawaban to offline storage:', error)
      throw error
    }
  }

  // Ambil semua jawaban untuk ujian tertentu
  async getJawabanByUjian(ujianId: string): Promise<Record<string, string>> {
    if (!this.isSupported) return {}

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jawaban'], 'readonly')
        const store = transaction.objectStore('jawaban')
        const index = store.index('ujianId')
        const request = index.getAll(ujianId)

        request.onsuccess = () => {
          const jawabanRecord: Record<string, string> = {}
          request.result.forEach((item: any) => {
            jawabanRecord[item.soalId] = item.jawaban
          })
          db.close()
          resolve(jawabanRecord)
        }

        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error getting jawaban:', error)
      return {}
    }
  }

  // Simpan status ujian (waktu sisa, dll)
  async simpanStatusUjian(
    ujianId: string,
    status: { waktuSisa: number; lastUpdate: string }
  ): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ujian_status'], 'readwrite')
        const store = transaction.objectStore('ujian_status')

        const record = {
          ujianId,
          ...status,
          syncStatus: 'pending' as const,
        }

        store.put(record)

        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
    } catch (error) {
      console.error('Error saving ujian status:', error)
      throw error
    }
  }

  // Ambil status ujian
  async getStatusUjian(ujianId: string): Promise<{ waktuSisa: number; lastUpdate: string } | null> {
    if (!this.isSupported) return null

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ujian_status'], 'readonly')
        const store = transaction.objectStore('ujian_status')
        const request = store.get(ujianId)

        request.onsuccess = () => {
          db.close()
          resolve(request.result || null)
        }

        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error getting ujian status:', error)
      return null
    }
  }

  // Hapus semua data ujian (setelah submit)
  async hapusDataUjian(ujianId: string): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jawaban', 'ujian_status'], 'readwrite')

        // Hapus jawaban
        const jawabanStore = transaction.objectStore('jawaban')
        const jawabanIndex = jawabanStore.index('ujianId')
        const jawabanRequest = jawabanIndex.openCursor(ujianId)

        jawabanRequest.onsuccess = (event: any) => {
          const cursor = event.target.result
          if (cursor) {
            cursor.delete()
            cursor.continue()
          }
        }

        // Hapus status
        const statusStore = transaction.objectStore('ujian_status')
        statusStore.delete(ujianId)

        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
    } catch (error) {
      console.error('Error deleting ujian data:', error)
      throw error
    }
  }

  // Get pending sync data
  async getPendingJawaban(): Promise<any[]> {
    if (!this.isSupported) return []

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['jawaban'], 'readonly')
        const store = transaction.objectStore('jawaban')
        const request = store.getAll()

        request.onsuccess = () => {
          const allRecords = request.result || []
          const pendingRecords = allRecords.filter((record: any) => record.syncStatus === 'pending')
          db.close()
          resolve(pendingRecords)
        }

        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error getting pending jawaban:', error)
      return []
    }
  }

  // Mark as synced
  async markJawabanAsSynced(keys: { ujianId: string; soalId: string }[]): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve) => {
        const transaction = db.transaction(['jawaban'], 'readwrite')
        const store = transaction.objectStore('jawaban')

        let completed = 0
        const total = keys.length

        if (total === 0) {
          db.close()
          resolve()
          return
        }

        const checkCompletion = () => {
          completed++
          if (completed === total) {
            db.close()
            resolve()
          }
        }

        keys.forEach((key) => {
          const getRequest = store.get([key.ujianId, key.soalId])
          getRequest.onsuccess = () => {
            const record = getRequest.result
            if (record) {
              record.syncStatus = 'synced'
              const putRequest = store.put(record)
              putRequest.onsuccess = checkCompletion
              putRequest.onerror = () => checkCompletion()
            } else {
              checkCompletion()
            }
          }
          getRequest.onerror = () => checkCompletion()
        })
      })
    } catch (error) {
      console.error('Error marking jawaban as synced:', error)
      throw error
    }
  }

  isStorageSupported(): boolean {
    return this.isSupported
  }
}

export const ujianStorage = new UjianStorageService()
