// app/models/bank_soal.ts
import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import encryption from '@adonisjs/core/services/encryption'
import DataMapel from './data_mapel.js'

export default class BankSoal extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare namaUjian: string

  @column()
  declare jenjang: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare jurusan: string[]

  @column()
  declare kode: string

  @column()
  declare jenisUjian: 'PAS' | 'PAT' | 'Ujian Mandiri'

  @column()
  declare mapelId: number

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare penulis: string[]

  @column()
  declare waktu: string

  @column()
  declare tanggalUjian: string

  @column({
    consume: (value: string) => encryption.decrypt(value),
  })
  declare soalFile: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => DataMapel, {
    foreignKey: 'mapelId',
    localKey: 'id',
  })
  declare mapel: BelongsTo<typeof DataMapel>

  @beforeCreate()
  public static async generateUuid(bankSoal: BankSoal) {
    bankSoal.id = randomUUID()
  }

  @beforeSave()
  public static async encryptSoalFile(bankSoal: BankSoal) {
    if (bankSoal.$dirty.soalFile) {
      bankSoal.soalFile = encryption.encrypt(bankSoal.soalFile)
    }
  }

  public decryptSoalFile(): string {
    return encryption.decrypt(this.soalFile)!
  }
}
