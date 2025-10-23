class OfflineStorageService {
  private dbName = 'UjianDB'
  private version = 1
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

        // Create object store tanpa index
        if (!db.objectStoreNames.contains('ujian')) {
          db.createObjectStore('ujian', {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
      }
    })
  }

  async saveUjian(ujian: any[]): Promise<void> {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported, skipping offline storage')
      return
    }

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ujian'], 'readwrite')
        const store = transaction.objectStore('ujian')

        ujian.forEach((item) => {
          const record = {
            ...item,
            syncStatus: 'pending',
            createdAt: new Date().toISOString(),
          }
          store.put(record)
        })

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
      console.error('Error saving to offline storage:', error)
      throw error
    }
  }

  async getUjian(status: 'pending' | 'synced' | 'all'): Promise<any[]> {
    if (!this.isSupported) return []

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ujian'], 'readonly')
        const store = transaction.objectStore('ujian')
        const request = store.getAll()

        request.onsuccess = () => {
          const allRecords = request.result || []
          let pendingRecords = allRecords
          if (status != 'all') {
            pendingRecords = allRecords.filter((record: any) => record.syncStatus === status)
          }
          db.close()
          resolve(pendingRecords)
        }

        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error getting pending ujian:', error)
      return []
    }
  }

  async markAsSynced(ids: number[]): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()
      const transaction = db.transaction(['ujian'], 'readwrite')
      const store = transaction.objectStore('ujian')

      const request = store.openCursor()
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          const record = cursor.value
          record.syncStatus = 'synced'
          store.put(record)
          cursor.continue()
        }
      }
    } catch (error) {
      console.error('Error marking as synced:', error)
      throw error
    }
  }

  async clearSyncedData(status: 'pending' | 'synced' | 'all'): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ujian'], 'readwrite')
        const store = transaction.objectStore('ujian')
        const request = store.getAll()

        request.onsuccess = () => {
          const allRecords = request.result || []
          let syncedRecords = allRecords
          if (status != 'all') {
            syncedRecords = allRecords.filter((record: any) => record.syncStatus === status)
          }

          if (syncedRecords.length === 0) {
            db.close()
            resolve()
            return
          }

          let deleted = 0
          syncedRecords.forEach((record: any) => {
            const deleteRequest = store.delete(record.id)
            deleteRequest.onsuccess = () => {
              deleted++
              if (deleted === syncedRecords.length) {
                db.close()
                resolve()
              }
            }
            deleteRequest.onerror = () => {
              deleted++
              if (deleted === syncedRecords.length) {
                db.close()
                resolve()
              }
            }
          })

          reject(syncedRecords)
        }

        request.onerror = () => {
          db.close()
          reject(request.error)
        }
      })
    } catch (error) {
      console.error('Error clearing synced data:', error)
      throw error
    }
  }

  isStorageSupported(): boolean {
    return this.isSupported
  }
}

export const offlineStorage = new OfflineStorageService()
