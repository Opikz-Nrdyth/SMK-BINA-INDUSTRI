import vine from '@vinejs/vine'

export const informasiValidator = vine.compile(
  vine.object({
    judul: vine.string().minLength(3),
    deskripsi: vine.string().minLength(10),
    roleTujuan: vine.string(),
    publishAt: vine.string(),
    closeAt: vine.string(),
  })
)
