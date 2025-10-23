import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_kelas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('jenjang')
      table.string('nama_kelas')
      table.json('siswa')
      table.json('guru_pengampu')
      table.string('wali_kelas').references('nip').inTable('data_gurus')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
