import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'data_passwords'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.json('ujian')
      table.text('kode', 'longtext')
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
