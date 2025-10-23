import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeDelete, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'crypto'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import FileUploadService from '#services/file_upload_service'
import encryption from '@adonisjs/core/services/encryption'

export default class Blog extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare judul: string

  @column()
  declare slug: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare konten: string

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare ringkasan: string | null

  @column({
    prepare: (value: string) => encryption.encrypt(value),
    consume: (value: string | null) => {
      if (!value) return null
      return encryption.decrypt(value)
    },
  })
  declare thumbnail: string | null

  @column()
  declare status: 'draft' | 'published' | 'archived'

  @column()
  declare kategori: string | null

  @column()
  declare tags: string | null

  @column()
  declare dilihat: number

  @column()
  declare penulisId: string

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'penulisId',
  })
  declare penulis: BelongsTo<typeof User>

  @beforeCreate()
  public static async generateUuid(blog: Blog) {
    blog.id = randomUUID()
  }

  @beforeCreate()
  public static async generateSlug(blog: Blog) {
    if (!blog.slug) {
      blog.slug = blog.judul
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }
  }

  @beforeDelete()
  public static async deleteThumbnail(blog: Blog) {
    if (blog.thumbnail) {
      const fileService = new FileUploadService()
      await fileService.deleteFile(blog.thumbnail)
    }
  }

  get thumbnailUrl(): string | null {
    if (!this.thumbnail) return null
    const fileService = new FileUploadService()
    return fileService.getFileUrl(this.thumbnail)
  }
}
