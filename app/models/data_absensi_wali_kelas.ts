// app/models/data_absensi_wali_kelas.ts
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import DataKelas from './data_kelas.js'

export default class DataAbsensiWaliKelas extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare kelasId: string

  @column()
  declare status: 'Hadir' | 'Sakit' | 'Alfa' | 'Izin' | 'PKL'

  @column.dateTime()
  declare hari: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => DataKelas, {
    foreignKey: 'kelasId',
  })
  declare kelas: BelongsTo<typeof DataKelas>
}
