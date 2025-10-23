import vine from '@vinejs/vine'

export const mapelValidator = vine.compile(
  vine.object({
    namaMataPelajaran: vine.string(),
    jenjang: vine.string(),
    guruAmpu: vine.array(vine.string()).minLength(1),
  })
)
