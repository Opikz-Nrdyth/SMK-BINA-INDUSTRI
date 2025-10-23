import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import DataKelas from './data_kelas.js'
import DataMapel from './data_mapel.js'
import encryption from '@adonisjs/core/services/encryption'

export default class DataGuru extends BaseModel {
  public static primaryKey = 'nip'
  public static incrementing = false

  @column({ isPrimary: true })
  declare nip: string

  @column()
  declare userId: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare alamat: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare noTelepon: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare gelarDepan: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare gelarBelakang: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare jenisKelamin: 'Laki-laki' | 'Perempuan'

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare tempatLahir: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare tanggalLahir: Date

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare agama: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare fileFoto: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @hasOne(() => DataKelas, {
    foreignKey: 'waliKelas',
    localKey: 'nip',
  })
  declare waliKelas: HasOne<typeof DataKelas>

  @hasMany(() => DataMapel, {
    foreignKey: 'guruAmpu',
    localKey: 'nip',
  })
  declare mapel: HasMany<typeof DataMapel>

  public async mapelAmpu() {
    const semuaMapel = await DataMapel.all()

    return semuaMapel.filter((mapel) => mapel.getGuruAmpuArray().includes(this.nip))
  }

  public async mapelAmpuGuru() {
    return await DataMapel.query().whereRaw('JSON_CONTAINS(guru_ampu, JSON_QUOTE(?))', [this.nip])
  }
}
