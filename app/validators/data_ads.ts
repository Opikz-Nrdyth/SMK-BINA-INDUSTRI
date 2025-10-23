import vine from '@vinejs/vine'

export const adsValidator = vine.compile(
  vine.object({
    judul: vine.string().trim(),
    deskripsi: vine.string().trim().optional(),
    tipe: vine.enum(['banner', 'popup']),
    tautan: vine.string().url().optional(),
    aktif: vine.boolean().optional(),
    tanggal_mulai: vine.date().optional(),
    tanggal_selesai: vine.date().optional(),
  })
)
