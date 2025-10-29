import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_absensis';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
            table
                .integer('mapel_id')
                .references('id')
                .inTable('data_mapels')
                .onDelete('SET NULL')
                .unsigned()
                .nullable();
            table.uuid('kelas_id').references('id').inTable('data_kelas').onDelete('SET NULL').nullable();
            table.enum('status', ['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']);
            table.timestamp('hari');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759156343888_create_data_absensis_table.js.map