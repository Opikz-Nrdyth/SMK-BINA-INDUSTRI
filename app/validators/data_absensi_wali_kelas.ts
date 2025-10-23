// app/validators/data_absensi_wali_kelas.ts
import vine from '@vinejs/vine'

export const absensiWaliKelasValidator = vine.compile(
  vine.object({
    tanggal: vine.string(),
    kelasId: vine.string(),
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

export const absensiWaliKelasBulkValidator = vine.compile(
  vine.object({
    absensi: vine
      .array(
        vine.object({
          userId: vine.string(),
          kelasId: vine.string(),
          status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
          hari: vine.string(),
        })
      )
      .minLength(1),
  })
)

export const absensiWaliKelasUpdateValidator = vine.compile(
  vine.object({
    userId: vine.string(),
    kelasId: vine.string(),
    status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
    hari: vine.string(),
  })
)
