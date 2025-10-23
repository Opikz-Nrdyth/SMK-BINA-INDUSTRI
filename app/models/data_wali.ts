import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import DataSiswa from './data_siswa.js'
import encryption from '@adonisjs/core/services/encryption'

export default class DataWali extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare nisn: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare nik: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare nama: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare tanggalLahir: Date | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare pendidikan: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare pekerjaan: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare penghasilan: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare noHp: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare hubungan: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid(dataWali: DataWali) {
    dataWali.id = randomUUID()
  }

  @belongsTo(() => DataSiswa, {
    foreignKey: 'nisn',
  })
  declare dataSiswa: BelongsTo<typeof DataSiswa>
}
