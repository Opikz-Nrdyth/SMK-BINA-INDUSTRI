import DataGuru from '#models/data_guru'
import DataKelas from '#models/data_kelas'
import DataStaf from '#models/data_staf'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoleManajemenMiddleware {
  async handle(ctx: HttpContext, next: () => Promise<void>, allowedRoles: string[]) {
    const user = ctx.auth.user

    // Belum login → arahkan ke login
    if (!user) {
      return ctx.response.redirect('/login')
    }

    let isWaliKelas = false
    if (user.role === 'Guru') {
      try {
        const guru = await DataGuru.query().where('userId', user.id).first()
        if (guru) {
          const kelasWali = await DataKelas.query().where('waliKelas', guru.nip).first()
          isWaliKelas = !!kelasWali
        }
      } catch (error) {
        console.error('Error checking wali kelas:', error)
        isWaliKelas = false
      }
    }

    let dataStaf
    if (user.role == 'Staf') {
      dataStaf = await DataStaf.query().where('user_id', user?.id).first()
    }

    const pageName = ctx.route?.name
    const pattern = ctx.route?.pattern
    ctx.inertia.share({
      user,
      route: pageName || '-',
      pattern: pattern || '',
      isWaliKelas,
      departement: dataStaf?.departemen || '',
    })

    // Kalau bukan role yang sesuai → redirect ke dashboard role user
    if (!allowedRoles.includes(user.role)) {
      switch (user.role) {
        case 'SuperAdmin':
          return ctx.response.redirect('/SuperAdmin')
        case 'Guru':
          return ctx.response.redirect('/guru')
        case 'Siswa':
          return ctx.response.redirect('/siswa')
        case 'Staf':
          return ctx.response.redirect('/staf')
        default:
          return ctx.response.redirect('/login')
      }
    }

    // Kalau sesuai role → lanjut
    await next()
  }
}
