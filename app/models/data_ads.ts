import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'

export default class DataAds extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare judul: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare deskripsi?: string | null

  @column()
  declare tipe: 'banner' | 'popup'

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare gambar?: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare tautan?: string | null

  @column()
  declare aktif: boolean

  @column()
  declare tanggalMulai?: Date | null

  @column()
  declare tanggalSelesai?: Date | null

  @column()
  declare createdBy?: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
