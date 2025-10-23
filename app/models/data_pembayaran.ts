import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import User from './user.js'
import encryption from '@adonisjs/core/services/encryption'

export default class DataPembayaran extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare jenisPembayaran: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare nominalPenetapan: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare nominalBayar: string // JSON string

  @column()
  declare partisipasiUjian: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  public static async generateUuid(pembayaran: DataPembayaran) {
    pembayaran.id = randomUUID()
  }

  // Method untuk mendapatkan array nominal bayar dari JSON dengan error handling
  public getNominalBayarArray(): Array<{ nominal: string; tanggal: string }> {
    try {
      if (!this.nominalBayar) {
        return []
      }

      const parsed = this.nominalBayar
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error parsing nominalBayar JSON:', error)
      return []
    }
  }

  // Method untuk menghitung total yang sudah dibayar dengan error handling
  public getTotalDibayar(): number {
    const nominalArray = this.getNominalBayarArray()
    return nominalArray.reduce((total, item) => {
      const nominal = parseFloat(item.nominal || '0')
      return total + (isNaN(nominal) ? 0 : nominal)
    }, 0)
  }

  // Method untuk mendapatkan sisa pembayaran
  public getSisaPembayaran(): number {
    const totalDibayar = this.getTotalDibayar()
    const penetapan = parseFloat(this.nominalPenetapan || '0')
    return penetapan - totalDibayar
  }

  // Method untuk menambah pembayaran
  public addPembayaran(nominal: string, tanggal: string): void {
    const currentData = this.getNominalBayarArray()
    currentData.push({ nominal, tanggal })
    this.nominalBayar = JSON.stringify(currentData)
  }
}
