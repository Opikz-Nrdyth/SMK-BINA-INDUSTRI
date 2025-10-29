import vine from '@vinejs/vine';
export const tahunAjaranValidator = vine.compile(vine.object({
    kodeTa: vine.string(),
    tahunAjaran: vine.string(),
    kepalaSekolah: vine.string(),
}));
//# sourceMappingURL=data_tahun_ajaran.js.map