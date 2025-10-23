import vine from '@vinejs/vine'

export const pembayaranValidator = vine.compile(
  vine.object({
    userId: vine.string(),
    jenisPembayaran: vine.string(),
    nominalPenetapan: vine.string(),
    partisipasiUjian: vine.boolean().optional(),
  })
)

export const pembayaranUpdateValidator = vine.compile(
  vine.object({
    userId: vine.string(),
    jenisPembayaran: vine.string(),
    nominalPenetapan: vine.string(),
    partisipasiUjian: vine.boolean().optional(),
  })
)

export const tambahPembayaranValidator = vine.compile(
  vine.object({
    nominal: vine.string(),
    tanggal: vine.string(),
  })
)
