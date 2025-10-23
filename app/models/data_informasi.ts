import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'crypto'

export default class DataInformasi extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare judul: string

  @column()
  declare deskripsi: string

  @column()
  declare roleTujuan: string

  @column()
  declare publishAt: DateTime | string

  @column()
  declare closeAt: DateTime | string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid(informasi: DataInformasi) {
    informasi.id = randomUUID()
  }
}
