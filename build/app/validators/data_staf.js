import vine from '@vinejs/vine';
export const userStafValidator = vine.compile(vine.object({
    user: vine.object({
        fullName: vine.string().minLength(3),
        email: vine.string().email(),
        password: vine.string().minLength(8).confirmed().optional(),
    }),
    staf: vine.object({
        nip: vine.string(),
        departemen: vine.string().optional(),
        jabatan: vine.string().optional(),
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
//# sourceMappingURL=data_staf.js.map