class OfflineStorageService {
  private dbName = 'PPDB'
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
        if (!db.objectStoreNames.contains('ppdb')) {
          db.createObjectStore('ppdb', {
            keyPath: 'id',
            autoIncrement: true,
          })
        }
      }
    })
  }

  async save(ppdb: any): Promise<void> {
    if (!this.isSupported) {
      console.warn('IndexedDB not supported, skipping offline storage')
      return
    }

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ppdb'], 'readwrite')
        const store = transaction.objectStore('ppdb')

        const record = {
          id: 1,
          ppdb,
          syncStatus: 'pending',
          createdAt: new Date().toISOString(),
        }
        store.put(record)

        transaction.oncomplete = () => {
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

  async getPending(): Promise<any[]> {
    if (!this.isSupported) return []

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ppdb'], 'readonly')
        const store = transaction.objectStore('ppdb')
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
      console.error('Error getting pending ppdb:', error)
      return []
    }
  }

  async markAsSynced(ids: number[]): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ppdb'], 'readwrite')
        const store = transaction.objectStore('ppdb')

        let completed = 0
        const total = ids.length

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

        ids.forEach((id) => {
          const getRequest = store.get(id)
          getRequest.onsuccess = () => {
            const record = getRequest.result
            if (record) {
              record.syncStatus = 'synced'
              const putRequest = store.put(record)
              putRequest.onsuccess = checkCompletion
              putRequest.onerror = () => {
                checkCompletion() // Continue even if error
              }
            } else {
              checkCompletion()
            }
          }
          getRequest.onerror = () => {
            checkCompletion() // Continue even if error
          }
        })
      })
    } catch (error) {
      console.error('Error marking as synced:', error)
      throw error
    }
  }

  async clearSyncedData(): Promise<void> {
    if (!this.isSupported) return

    try {
      const db = await this.init()

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(['ppdb'], 'readwrite')
        const store = transaction.objectStore('ppdb')
        const request = store.getAll()

        request.onsuccess = () => {
          const allRecords = request.result || []
          const syncedRecords = allRecords.filter((record: any) => record.syncStatus === 'synced')

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
