import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_pembayarans';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
            table.text('jenis_pembayaran', 'longtext');
            table.text('nominal_penetapan', 'longtext');
            table.text('nominal_bayar', 'longtext');
            table.boolean('partisipasi_ujian').defaultTo(false);
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759238901522_create_data_pembayarans_table.js.map