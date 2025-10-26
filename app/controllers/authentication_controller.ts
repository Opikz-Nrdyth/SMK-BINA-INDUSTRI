import User from '#models/user'
import { Authentication, Register } from '#validators/authentication'
import type { HttpContext } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'

export default class AuthenticationController {
  async index({ inertia, response, auth, session }: HttpContext) {
    try {
      if (await auth.check()) {
        return response.redirect().toPath('/SuperAdmin')
      }

      const datUser = await User.query()
      let register = false
      if (datUser.length == 0) {
        register = true
      }

      return inertia.render('Login', {
        register,
        pilihRole: false,
        session: session.flashMessages.all(),
      })
    } catch (error) {
      logger.error({ err: error }, 'Gagal memuat halaman login')
      return inertia.render('Login', {
        register: false,
        session: {
          status: 'error',
          message: 'Gagal memuat halaman login',
          error: error,
        },
      })
    }
  }

  async store({ request, auth, response, session }: HttpContext) {
    try {
      const { email, password } = await request.validateUsing(Authentication)
      const { role } = request.all()

      // Verifikasi kredensial
      const user = await User.verifyCredentials(email, password)

      // Ambil data user + relasi
      const cekUser = await User.query()
        .where('email', email)
        .preload('dataGuru')
        .preload('dataStaf')
        .firstOrFail()

      // 🔹 Cek apakah user punya dua role (Guru dan Staf)
      if (cekUser.dataGuru && cekUser.dataStaf) {
        // Jika belum pilih role → tampilkan opsi pilih role
        if (!role) {
          session.flash({
            status: 'info',
            roleInput: true,
            message: 'Pilih status login sebagai Guru atau Staf.',
          })
          return response.redirect().back()
        }

        // Kalau sudah pilih role → simpan ke session
        session.put('role', role)
        await auth.use('web').login(user)

        session.flash({
          status: 'success',
          message: `Login berhasil sebagai ${role}`,
        })

        const redirectPath = role === 'Guru' ? '/guru' : role === 'Staf' ? '/staf' : '/SuperAdmin'

        return response.redirect().toPath(redirectPath)
      }

      // 🔹 Kalau user cuma punya 1 role
      const finalRole = cekUser.dataGuru
        ? 'Guru'
        : cekUser.dataStaf
          ? 'Staf'
          : user.role || 'SuperAdmin'

      // Kalau belum ada role di session → pakai role user
      const activeRole = session.get('role') || finalRole
      session.put('role', activeRole)

      await auth.use('web').login(user)

      session.flash({
        status: 'success',
        message: `Login berhasil sebagai ${activeRole}`,
      })

      // 🔹 Redirect berdasarkan role aktif
      const redirectPath =
        activeRole === 'Guru' ? '/guru' : activeRole === 'Staf' ? '/staf' : '/SuperAdmin'

      return response.redirect().toPath(redirectPath)
    } catch (error) {
      logger.error({ err: error }, 'Login gagal')

      session.flash({
        status: 'error',
        message: 'Email atau password salah',
        error: error,
      })

      return response.redirect().back()
    }
  }

  async register({ request, auth, response, session }: HttpContext) {
    try {
      const validate = await request.validateUsing(Register)

      const user = await User.create({
        email: validate.email,
        fullName: validate.fullName,
        password: validate.password,
        role: 'SuperAdmin',
      })
      await auth.use('web').login(user)

      session.flash({
        status: 'success',
        message: 'Registrasi berhasil',
      })

      return response.redirect().toPath('/SuperAdmin')
    } catch (error) {
      logger.error({ err: error }, 'Registrasi gagal')

      session.flash({
        status: 'error',
        message: 'Registrasi gagal',
        error: error,
      })

      return response.redirect().back()
    }
  }

  async destroy({ auth, response, session }: HttpContext) {
    try {
      await auth.use('web').logout()

      session.clear()
      session.flash({
        status: 'success',
        message: 'Logout berhasil',
      })

      return response.redirect('/login')
    } catch (error) {
      logger.error({ err: error }, 'Logout gagal')

      session.flash({
        status: 'error',
        message: 'Logout gagal',
        error: error,
      })

      return response.redirect().back()
    }
  }
}
