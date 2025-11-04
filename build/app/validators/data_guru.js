import vine from '@vinejs/vine';
export const userGuruValidator = vine.compile(vine.object({
    user: vine.object({
        fullName: vine.string().minLength(3),
        email: vine.string().email(),
        password: vine.string().minLength(8).confirmed().optional(),
    }),
    guru: vine.object({
        nip: vine.string(),
        alamat: vine.string().optional(),
        noTelepon: vine.string().optional(),
        gelarDepan: vine.string().optional(),
        gelarBelakang: vine.string().optional(),
        jenisKelamin: vine.enum(['Laki-laki', 'Perempuan']).optional(),
        tempatLahir: vine.string().optional(),
        tanggalLahir: vine.date().optional(),
        agama: vine.enum(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']).optional(),
    }),
}));
//# sourceMappingURL=data_guru.js.map