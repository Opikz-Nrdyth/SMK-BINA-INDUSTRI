import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_ads';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.uuid('id').primary();
            table.text('judul', 'longtext').notNullable();
            table.text('deskripsi', 'longtext').nullable();
            table.string('tipe').notNullable();
            table.text('gambar', 'longtext').nullable();
            table.text('tautan', 'longtext').nullable();
            table.boolean('aktif').defaultTo(false);
            table.date('tanggal_mulai').nullable();
            table.date('tanggal_selesai').nullable();
            table.uuid('created_by').nullable();
            table.timestamp('created_at').defaultTo(this.now());
            table.timestamp('updated_at').defaultTo(this.now());
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759900697229_create_data_ads_table.js.map