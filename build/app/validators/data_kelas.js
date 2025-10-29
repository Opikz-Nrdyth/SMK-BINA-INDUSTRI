import vine from '@vinejs/vine';
export const kelasValidator = vine.compile(vine.object({
    jenjang: vine.string(),
    namaKelas: vine.string(),
    waliKelas: vine.string(),
    siswa: vine.array(vine.string()).minLength(1),
    guruPengampu: vine.array(vine.string()).minLength(1),
}));
//# sourceMappingURL=data_kelas.js.map