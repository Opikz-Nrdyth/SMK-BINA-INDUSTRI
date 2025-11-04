import vine from '@vinejs/vine';
export const jurusanValidator = vine.compile(vine.object({
    kelasId: vine.array(vine.string()),
    kodeJurusan: vine.string(),
    namaJurusan: vine.string(),
    akreditasi: vine.string().optional(),
}));
//# sourceMappingURL=data_jurusan.js.map