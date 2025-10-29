import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_mapels';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('nama_mata_pelajaran');
            table.string('jenjang');
            table.json('guru_ampu');
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1759071280832_create_data_mapels_table.js.map