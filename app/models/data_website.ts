import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import encryption from '@adonisjs/core/services/encryption'

export default class DataWebsite extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare value: any

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  static async getAllSettings() {
    const settings = await this.all()
    const result: { [key: string]: any } = {}

    settings.forEach((setting) => {
      result[setting.name] = setting.value
    })

    return result
  }

  static async updateSetting(name: string, value: any) {
    let setting = await this.findBy('name', name)

    if (setting) {
      setting.value = value
      await setting.save()
    } else {
      setting = await this.create({ name, value })
    }

    return setting
  }
}
