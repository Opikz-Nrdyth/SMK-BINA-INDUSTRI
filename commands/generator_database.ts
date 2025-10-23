import { BaseCommand } from '@adonisjs/core/ace'
import path from 'path'
import fs from 'fs'
import db from '@adonisjs/lucid/services/db'

export default class GeneratorDatabase extends BaseCommand {
  static commandName = 'generator:database'
  public static description = 'Generate Lucid model and Vine validator from MySQL table'

  public async run() {
    const tableName = await this.prompt.ask('Nama tabel di database')
    const modelName = await this.prompt.ask('Nama model yang ingin dibuat')
    const validatorName = await this.prompt.ask('Nama validator yang ingin dibuat')

    // Ambil kolom MySQL
    const columns: any[] = await db.from(tableName).columns

    // ------------------ GENERATE MODEL ------------------
    const modelPath = path.join('app/Models', `${modelName}.ts`)
    let modelContent = `import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'\n\n`
    modelContent += `export default class ${modelName} extends BaseModel {\n`
    columns.forEach((col) => {
      let type = 'string'
      if (col.Type.includes('int') || col.Type.includes('decimal') || col.Type.includes('float'))
        type = 'number'
      if (col.Type.includes('date') || col.Type.includes('timestamp')) type = 'Date'
      const optional = col.Null === 'YES' ? ' | null' : ''
      modelContent += `  @column()\n  declare ${col.Field}: ${type}${optional}\n\n`
    })
    modelContent += '}\n'
    fs.writeFileSync(modelPath, modelContent)
    this.logger.info(`Model ${modelName} berhasil dibuat di ${modelPath}`)

    // ------------------ GENERATE VINE VALIDATOR ------------------
    const validatorPath = path.join('app/Validators', `${validatorName}.ts`)
    let validatorContent = `import { vine } from '@adonisjs/vine'\n\n`
    validatorContent += `export const ${validatorName} = vine.object({\n`
    columns.forEach((col) => {
      let vineType = 'vine.string()'
      if (col.Type.includes('int') || col.Type.includes('decimal') || col.Type.includes('float'))
        vineType = 'vine.number()'
      if (col.Type.includes('date') || col.Type.includes('timestamp')) vineType = 'vine.date()'
      if (col.Null === 'YES') vineType += '.optional()'

      validatorContent += `  ${col.Field}: ${vineType},\n`
    })
    validatorContent += '})\n'
    fs.writeFileSync(validatorPath, validatorContent)
    this.logger.info(`Validator ${validatorName} berhasil dibuat di ${validatorPath}`)
  }
}
