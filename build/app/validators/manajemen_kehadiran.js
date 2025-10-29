import vine from '@vinejs/vine';
export const kehadiranValidator = vine.compile(vine.object({
    userId: vine.string(),
    ujianId: vine.string(),
    skor: vine.string().optional(),
    benar: vine.string().optional(),
    salah: vine.string().optional(),
    jawabanFile: vine.string().optional(),
}));
//# sourceMappingURL=manajemen_kehadiran.js.map