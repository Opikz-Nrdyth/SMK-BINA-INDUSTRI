import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'crypto'

export default class DataJurusan extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare kelasId: string[]

  @column()
  declare kodeJurusan: string

  @column()
  declare namaJurusan: string

  @column()
  declare akreditasi: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid(jurusan: DataJurusan) {
    jurusan.id = randomUUID()
  }
}
