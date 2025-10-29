import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'manajemen_kehadirans';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.uuid('ujian_id').references('id').inTable('bank_soals').onDelete('SET NULL');
            table.text('skor', 'longtext');
            table.text('benar', 'longtext');
            table.text('salah', 'longtext');
            table.text('jawaban_file', 'longtext');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759320573752_create_manajemen_kehadirans_table.js.map