// app/models/manajemen_kehadiran.ts
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, column, belongsTo } from '@adonisjs/lucid/orm'
import { randomUUID } from 'crypto'
import encryption from '@adonisjs/core/services/encryption'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import BankSoal from './bank_soal.js'

export default class ManajemenKehadiran extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare ujianId: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare skor: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare benar: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare salah: string

  @column({
    consume: (value: string) => encryption.decrypt(value),
  })
  declare jawabanFile: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => BankSoal, {
    foreignKey: 'ujianId',
  })
  declare ujian: BelongsTo<typeof BankSoal>

  @beforeCreate()
  public static async generateUuid(kehadiran: ManajemenKehadiran) {
    kehadiran.id = randomUUID()
  }

  @beforeSave()
  public static async encryptJawabanFile(kehadiran: ManajemenKehadiran) {
    if (kehadiran.$dirty.jawabanFile) {
      kehadiran.jawabanFile = encryption.encrypt(kehadiran.jawabanFile)
    }
  }

  public decryptJawabanFile(): string {
    return encryption.decrypt(this.jawabanFile)!
  }
}
