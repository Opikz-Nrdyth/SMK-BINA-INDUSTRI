import { BaseSchema } from '@adonisjs/lucid/schema';
export default class extends BaseSchema {
    tableName = 'data_siswas';
    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('nisn').primary();
            table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE').unique();
            table.text('jenis_kelamin', 'longtext');
            table.text('nik', 'longtext').nullable().defaultTo(null);
            table.text('no_kk', 'longtext').nullable().defaultTo(null);
            table.text('tempat_lahir', 'longtext');
            table.text('tanggal_lahir', 'longtext');
            table.text('no_akta_lahir', 'longtext');
            table.text('agama', 'longtext');
            table.text('kewarganegaraan', 'longtext');
            table.text('alamat', 'longtext');
            table.text('rt');
            table.text('rw');
            table.text('dusun', 'longtext').nullable().defaultTo(null);
            table.text('kelurahan', 'longtext').nullable().defaultTo(null);
            table.text('kecamatan', 'longtext');
            table.text('kode_pos', 'longtext');
            table.text('jenis_tinggal', 'longtext');
            table.text('transportasi', 'longtext').nullable().defaultTo(null);
            table.text('anak_ke', 'longtext');
            table.text('jumlah_saudara', 'longtext');
            table.text('penerima_kip', 'longtext');
            table.text('no_telepon', 'longtext');
            table.text('berat_badan', 'longtext').nullable().defaultTo(null);
            table.text('tinggi_badan', 'longtext').nullable().defaultTo(null);
            table.text('lingkar_kepala', 'longtext').nullable().defaultTo(null);
            table.text('jarak_sekolah', 'longtext').nullable().defaultTo(null);
            table.text('waktu_tempuh', 'longtext').nullable().defaultTo(null);
            table.text('jenis_kesejahteraan', 'longtext');
            table.text('nomor_kartu', 'longtext').nullable().defaultTo(null);
            table.text('nama_di_kartu', 'longtext').nullable().defaultTo(null);
            table.text('no_kps', 'longtext').nullable().defaultTo(null);
            table.text('jenis_pendaftaran', 'longtext');
            table.text('sekolah_asal', 'longtext');
            table.text('npsn', 'longtext').nullable().defaultTo(null);
            table.text('sekolah_asal_pindahan', 'longtext').nullable().defaultTo(null);
            table.text('surat_keterangan_pindah', 'longtext').nullable().defaultTo(null);
            table.enum('status', ['praregist', 'daftarulang', 'siswa']).defaultTo('praregist');
            table.text('file_akta', 'longtext').nullable().defaultTo(null);
            table.text('file_kk', 'longtext').nullable().defaultTo(null);
            table.text('file_ijazah', 'longtext').nullable().defaultTo(null);
            table.text('file_foto', 'longtext').nullable().defaultTo(null);
            table.text('hobby', 'longtext').nullable().defaultTo(null);
            table.text('citacita', 'longtext').nullable().defaultTo(null);
            table.timestamp('created_at');
            table.timestamp('updated_at');
        });
    }
    async down() {
        this.schema.dropTable(this.tableName);
    }
}
//# sourceMappingURL=1758910808837_create_data_siswas_table.js.map