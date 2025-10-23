import vine from '@vinejs/vine'

export const jurusanValidator = vine.compile(
  vine.object({
    kelasId: vine.array(vine.string()).minLength(1),
    kodeJurusan: vine.string(),
    namaJurusan: vine.string(),
    akreditasi: vine.string().optional(),
  })
)
