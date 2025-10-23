import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blogs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.text('judul', 'longtext').notNullable()
      table.text('slug').notNullable()
      table.text('konten', 'longtext').notNullable()
      table.text('ringkasan', 'longtext').nullable()
      table.text('thumbnail', 'longtext').nullable()
      table.string('status').defaultTo('draft')
      table.string('kategori').nullable()
      table.string('tags').nullable()
      table.integer('dilihat').defaultTo(0)
      table.uuid('penulis_id').references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('published_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
