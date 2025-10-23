import { BaseCommand } from '@adonisjs/core/ace'
import fs from 'node:fs'
import path from 'node:path'

export default class StorageLink extends BaseCommand {
  static commandName = 'storage:link'
  static description = 'Create a symbolic link from "public/storage" to "storage/app"'

  async run() {
    const publicStoragePath = path.join(process.cwd(), 'public', 'storage')
    const storageAppPath = path.join(process.cwd(), 'storage', '')

    try {
      // Check if storage/app exists
      if (!fs.existsSync(storageAppPath)) {
        this.logger.error('Storage directory does not exist: storage/app/')
        return
      }

      // Check if link already exists
      if (fs.existsSync(publicStoragePath)) {
        const stats = fs.lstatSync(publicStoragePath)
        if (stats.isSymbolicLink()) {
          this.logger.success('Storage link already exists!')
          return
        } else {
          this.logger.error('public/storage already exists and is not a symbolic link')
          return
        }
      }

      // Create symbolic link
      fs.symlinkSync(storageAppPath, publicStoragePath, 'junction')

      this.logger.success('The [public/storage] directory has been linked to [storage/app]')
    } catch (error) {
      this.logger.error(`Failed to create storage link: ${error.message}`)
    }
  }
}
