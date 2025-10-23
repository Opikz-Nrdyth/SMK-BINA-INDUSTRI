import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_aktivitas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.text('nama', 'longtext').notNullable()
      table.string('jenis').notNullable()
      table.text('deskripsi', 'longtext').notNullable()
      table.text('lokasi', 'longtext').notNullable()
      table.text('tanggal_pelaksanaan', 'longtext').notNullable()
      table.enum('status', ['draft', 'published']).defaultTo('draft')
      table.text('dokumentasi', 'longtext').nullable()
      table.uuid('created_by').nullable()
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
