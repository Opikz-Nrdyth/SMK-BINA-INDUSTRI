import vine from '@vinejs/vine';
export const aktivitasValidator = vine.compile(vine.object({
    nama: vine.string().trim(),
    jenis: vine.enum([
        'ekstrakurikuler',
        'studi_tour',
        'lomba',
        'prestasi',
        'bakti_sosial',
        'upacara',
        'lainnya',
    ]),
    deskripsi: vine.string().trim(),
    lokasi: vine.string().trim(),
    tanggal_pelaksanaan: vine.date(),
    status: vine.enum(['draft', 'published']),
}));
//# sourceMappingURL=data_aktivitas.js.map