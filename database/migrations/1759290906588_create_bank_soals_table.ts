import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bank_soals'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('nama_ujian')
      table.string('jenjang')
      table.json('jurusan')
      table
        .integer('mapel_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('data_mapels')
        .onDelete('SET NULL')
      table.string('kode').unique()
      table.enum('jenis_ujian', ['Ujian Sekolah', 'Ujian Mandiri'])
      table.json('penulis')
      table.string('waktu')
      table.timestamp('tanggal_ujian')
      table.string('soal_file')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
