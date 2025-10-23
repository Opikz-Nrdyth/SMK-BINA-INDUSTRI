import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, hasOne } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { randomUUID } from 'crypto'
import DataSiswa from './data_siswa.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import DataGuru from './data_guru.js'
import DataStaf from './data_staf.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column()
  declare role: 'SuperAdmin' | 'Staf' | 'Guru' | 'Siswa'

  @column({ serializeAs: null })
  declare password: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @beforeCreate()
  public static async generateUuid(user: User) {
    user.id = randomUUID()
  }

  @hasOne(() => DataSiswa)
  declare dataSiswa: HasOne<typeof DataSiswa>

  @hasOne(() => DataGuru, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare dataGuru: HasOne<typeof DataGuru>

  @hasOne(() => DataStaf, {
    localKey: 'id',
    foreignKey: 'userId',
  })
  declare dataStaf: HasOne<typeof DataStaf>
}
