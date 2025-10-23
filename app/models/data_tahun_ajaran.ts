import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { randomUUID } from 'crypto'
import User from './user.js'

export default class DataTahunAjaran extends BaseModel {
  public static table = 'data_tahun_ajarans'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare kodeTa: string

  @column()
  declare tahunAjaran: string

  @column()
  declare kepalaSekolah: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'kepalaSekolah',
  })
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  public static async generateUuid(tahunAjaran: DataTahunAjaran) {
    tahunAjaran.id = randomUUID()
  }
}
