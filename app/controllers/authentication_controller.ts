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
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)

      session.flash({
        status: 'success',
        message: 'Login berhasil',
      })

      return response.redirect().toPath('/SuperAdmin')
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
