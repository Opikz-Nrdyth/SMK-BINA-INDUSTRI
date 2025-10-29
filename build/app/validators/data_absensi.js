import vine from '@vinejs/vine';
export const absensiValidator = vine.compile(vine.object({
    tanggal: vine.string(),
    kelasId: vine.string(),
    mapelId: vine.number() || vine.string(),
    absensi: vine
        .array(vine.object({
        userId: vine.string(),
        status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
    }))
        .minLength(1),
}));
export const absensiBulkValidator = vine.compile(vine.object({
    absensi: vine
        .array(vine.object({
        userId: vine.string(),
        mapelId: vine.number() || vine.string(),
        kelasId: vine.string(),
        status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
        hari: vine.string(),
    }))
        .minLength(1),
}));
export const absensiUpdateValidator = vine.compile(vine.object({
    userId: vine.string(),
    mapelId: vine.number() || vine.string(),
    kelasId: vine.string(),
    status: vine.enum(['Hadir', 'Sakit', 'Alfa', 'Izin', 'PKL']),
    hari: vine.string(),
}));
//# sourceMappingURL=data_absensi.js.map