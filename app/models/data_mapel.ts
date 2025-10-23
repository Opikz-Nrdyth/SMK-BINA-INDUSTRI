import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class DataMapel extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare namaMataPelajaran: string

  @column()
  declare jenjang: string

  @column()
  declare guruAmpu: string // JSON string yang berisi array NIP

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Method untuk mendapatkan array NIP dari JSON string
  public getGuruAmpuArray(): string[] {
    return typeof this.guruAmpu == 'string' ? JSON.parse(this.guruAmpu || '[]') : this.guruAmpu
  }

  // Method untuk menyimpan array NIP sebagai JSON string
  public setGuruAmpuArray(nips: string[]) {
    this.guruAmpu = JSON.stringify(nips)
  }
}
