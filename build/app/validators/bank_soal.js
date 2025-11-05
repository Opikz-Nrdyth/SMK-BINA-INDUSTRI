import vine from '@vinejs/vine';
export const bankSoalValidator = vine.compile(vine.object({
    namaUjian: vine.string().minLength(3),
    jenjang: vine.string(),
    jurusan: vine.array(vine.string().uuid()).minLength(1),
    mapel: vine.number(),
    jenisUjian: vine.enum(['PAS', 'PAT', 'Ujian Mandiri']),
    penulis: vine.array(vine.string().uuid()).minLength(1),
    waktu: vine.string(),
    kode: vine.string().optional(),
    tanggalUjian: vine.string(),
    soalFile: vine.string(),
}));
//# sourceMappingURL=bank_soal.js.map