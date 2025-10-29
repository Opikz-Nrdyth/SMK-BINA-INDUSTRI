import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_tahun_ajarans';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').primary();
            table.string('kode_ta');
            table.string('tahun_ajaran');
            table.string('kepala_sekolah').references('id').inTable('users').onDelete('SET NULL');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759069815497_create_data_tahun_ajarans_table.js.map