import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import type { NextFn } from '@adonisjs/core/types/http'
import { join } from 'path'
import fs from 'fs'

export default class LogVisitorMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const logFile = join(app.publicPath('visitors.json'))
    const storageDir = app.makePath('storage')

    // Pastikan folder storage ada
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true })
    }

    const ip = request.ip()
    const visitorData = {
      ip: request.ip(),
      ips: request.ips(),
      user_agent: request.header('user-agent') || '',
      path: request.url(),
      method: request.method(),
      visited_at: new Date().toISOString(),
    }

    try {
      if (!fs.existsSync(logFile)) {
        fs.writeFileSync(logFile, '[]', 'utf-8')
      }

      const data = fs.readFileSync(logFile, 'utf-8')
      const json = JSON.parse(data)

      const idx = json.findIndex((v: any) => v.ip === ip)
      if (idx === -1) {
        json.push(visitorData)
      }
      json.push(visitorData)
      const MAX_LOG = 1000
      if (json.length > MAX_LOG) json.splice(0, json.length - MAX_LOG)

      fs.writeFileSync(logFile, JSON.stringify(json, null, 2), 'utf-8')
    } catch (error) {
      console.error('Gagal menulis log visitor:', error)
    }

    await next()
  }
}
