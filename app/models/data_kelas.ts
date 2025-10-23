import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import DataGuru from './data_guru.js'

export default class DataKelas extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare jenjang: string

  @column()
  declare namaKelas: string

  @column()
  declare waliKelas: string

  @column()
  declare guruPengampu: string

  @column()
  declare siswa: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => DataGuru, {
    foreignKey: 'waliKelas',
    localKey: 'nip',
  })
  declare guru: BelongsTo<typeof DataGuru>

  @beforeCreate()
  public static async generateUuid(kelas: DataKelas) {
    kelas.id = randomUUID()
  }

  public getGuruAmpuArray(): string[] {
    try {
      return JSON.parse(this.guruPengampu || '[]')
    } catch {
      return []
    }
  }

  public setGuruAmpuArray(nips: string[]) {
    this.guruPengampu = JSON.stringify(nips)
  }

  public getSiswaArray(): string[] {
    try {
      return JSON.parse(this.siswa || '[]')
    } catch {
      return []
    }
  }

  public setSiswaArray(nisn: string[]) {
    this.siswa = JSON.stringify(nisn)
  }
}
