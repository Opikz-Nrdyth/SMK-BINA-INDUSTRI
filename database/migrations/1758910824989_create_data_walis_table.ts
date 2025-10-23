import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_walis'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nisn').references('nisn').inTable('data_siswas').onDelete('CASCADE')
      table.text('nik', 'longtext')
      table.text('nama', 'longtext')
      table.text('tanggal_lahir', 'longtext')
      table.text('pendidikan', 'longtext')
      table.text('pekerjaan', 'longtext')
      table.text('penghasilan', 'longtext').nullable().defaultTo(null)
      table.text('no_hp', 'longtext').nullable().defaultTo(null)
      table.text('hubungan', 'longtext')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
