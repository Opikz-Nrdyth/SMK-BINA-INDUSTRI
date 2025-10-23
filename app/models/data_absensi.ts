import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import DataMapel from './data_mapel.js'
import DataKelas from './data_kelas.js'

export default class DataAbsensi extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: string

  @column()
  declare mapelId: number

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

  @belongsTo(() => DataMapel, {
    foreignKey: 'mapelId',
    localKey: 'id',
  })
  declare mapel: BelongsTo<typeof DataMapel>

  @belongsTo(() => DataKelas, {
    foreignKey: 'kelasId',
    localKey: 'id',
  })
  declare kelas: BelongsTo<typeof DataKelas>
}
