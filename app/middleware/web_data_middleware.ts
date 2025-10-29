import DataWebsite from '#models/data_website'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'

export default class WebDataMiddleware {
  public async handle(ctx: HttpContext, next: NextFn) {
    const dataWeb = await DataWebsite.getAllSettings()
    ctx.inertia.share({
      phone: dataWeb.school_phone,
      fax: dataWeb.fax,
      email: dataWeb.school_email,
      website_name: dataWeb.school_name,
      yayasan: dataWeb.yayasan,
      timezone: app.config.get('app.timezone'),
      description: dataWeb.website_description,
      keywords: dataWeb.website_keywords,
      logo: dataWeb.school_logo,
      lat: dataWeb.lat,
      long: dataWeb.long,
      lihatNilai: dataWeb.lihatNilai,
      editProfile: dataWeb.editProfile,
      sejarah: dataWeb.school_description,
      address: dataWeb.school_address,
      login: dataWeb.text_login,
      hero_background:
        dataWeb.hero_background_image ?? 'https://placehold.co/400x400?text=No+Image',
    })

    await next()
  }
}
