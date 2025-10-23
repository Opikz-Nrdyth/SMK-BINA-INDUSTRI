import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_stafs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('nip').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique()
      table.string('departemen')
      table.string('jabatan')
      table.text('alamat', 'longtext')
      table.text('no_telepon', 'longtext')
      table.text('gelar_depan', 'longtext').nullable()
      table.text('gelar_belakang', 'longtext').nullable()
      table.text('jenis_kelamin', 'longtext')
      table.text('tempat_lahir', 'longtext')
      table.text('tanggal_lahir', 'longtext')
      table.text('agama', 'longtext')
      table.text('file_foto', 'longtext').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
