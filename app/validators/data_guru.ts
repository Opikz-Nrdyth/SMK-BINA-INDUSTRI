import vine from '@vinejs/vine'

export const userGuruValidator = vine.compile(
  vine.object({
    user: vine.object({
      fullName: vine.string().minLength(3),
      email: vine.string().email(),
      password: vine.string().minLength(8).confirmed().optional(),
    }),

    guru: vine.object({
      nip: vine.string(),
      alamat: vine.string(),
      noTelepon: vine.string(),
      gelarDepan: vine.string().optional(),
      gelarBelakang: vine.string().optional(),
      jenisKelamin: vine.enum(['Laki-laki', 'Perempuan']),
      tempatLahir: vine.string(),
      tanggalLahir: vine.date(),
      agama: vine.enum(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu']),
    }),
  })
)
