import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_jurusans';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table.json('kelas_id');
            table.string('kode_jurusan');
            table.string('nama_jurusan');
            table.string('akreditasi').nullable();
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759062291365_create_data_jurusans_table.js.map