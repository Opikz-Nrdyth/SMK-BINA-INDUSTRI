import vine from '@vinejs/vine';
export const userAccountValidator = vine.compile(vine.object({
    fullName: vine.string().trim().minLength(3),
    email: vine.string().email(),
    password: vine.string().minLength(8).optional(),
    alamat: vine.string().optional(),
    noTelepon: vine.string().optional(),
    jenisKelamin: vine.enum(['Laki-laki', 'Perempuan']).optional(),
    tempatLahir: vine.string().optional(),
    tanggalLahir: vine.date().optional(),
    agama: vine.string().optional(),
    gelarDepan: vine.string().optional(),
    gelarBelakang: vine.string().optional(),
}));
//# sourceMappingURL=user_account.js.map