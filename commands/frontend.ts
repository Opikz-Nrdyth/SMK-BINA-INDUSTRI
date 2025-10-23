import { BaseCommand } from '@adonisjs/core/ace'
import { args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export default class Frontend extends BaseCommand {
  static commandName = 'frontend'
  static description = 'Generate a new TSX file inside inertia/pages or inertia/Components'

  static options: CommandOptions = {}

  @args.string({ description: 'Nama file (tanpa ekstensi)' })
  declare name: string

  @flags.string({ description: 'Jenis: pages | components', alias: 't' })
  declare type: string

  async run() {
    const folder =
      this.type === 'pages'
        ? 'inertia/pages'
        : this.type === 'components'
          ? 'inertia/Components'
          : null

    if (!folder) {
      this.logger.error('Tipe harus "pages" atau "components" BOS 🚨')
      return
    }

    const rootPath = fileURLToPath(this.app.appRoot)
    const filePath = path.join(rootPath, folder, `${this.name}.tsx`)

    // cek kalau sudah ada
    try {
      await fs.access(filePath)
      this.logger.warning(`File ${filePath} sudah ada ⚠️`)
      return
    } catch {
      // lanjut bikin
    }

    const name = this.name.split('/')[1]
    const template = `
                    export default function ${name}() {
                      return (
                        <div>
                          <h1>${name} Component</h1>
                        </div>
                      )
                    }
                    `

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, template, 'utf-8')

    this.logger.success(`Berhasil buat ${filePath}`)
  }
}
