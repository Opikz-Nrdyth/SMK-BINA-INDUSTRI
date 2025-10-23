import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import encryption from '@adonisjs/core/services/encryption'

export default class DataAktivita extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare nama: string

  @column()
  declare jenis:
    | 'ekstrakurikuler'
    | 'studi_tour'
    | 'lomba'
    | 'prestasi'
    | 'bakti_sosial'
    | 'upacara'
    | 'lainnya'

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare deskripsi: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare lokasi: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare tanggalPelaksanaan: Date

  @column()
  declare status: 'draft' | 'published'

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare dokumentasi?: string | null

  @column()
  declare createdBy?: string | null

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare pembuat: BelongsTo<typeof User>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
