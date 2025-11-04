import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'

export default class DataPassword extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => (typeof value === 'string' ? JSON.parse(value) : value),
  })
  declare ujian: string[]

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare kode: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
