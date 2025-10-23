import vine from '@vinejs/vine'

// Validator untuk create form (multiple siswa)
export const absensiValidator = vine.compile(
  vine.object({
    tanggal: vine.string(),
    kelasId: vine.string(),
    mapelId: vine.number() || vine.string(),
    absensi: vine
      .array(
        vine.object({
          userId: vine.string(),
          status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
        })
      )
      .minLength(1),
  })
)

// Validator untuk bulk insert dari offline storage
export const absensiBulkValidator = vine.compile(
  vine.object({
    absensi: vine
      .array(
        vine.object({
          userId: vine.string(),
          mapelId: vine.number() || vine.string(),
          kelasId: vine.string(),
          status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
          hari: vine.string(),
        })
      )
      .minLength(1),
  })
)

// Validator untuk update single record
export const absensiUpdateValidator = vine.compile(
  vine.object({
    userId: vine.string(),
    mapelId: vine.number() || vine.string(),
    kelasId: vine.string(),
    status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
    hari: vine.string(),
  })
)
