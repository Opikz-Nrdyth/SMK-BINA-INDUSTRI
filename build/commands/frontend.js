var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BaseCommand } from '@adonisjs/core/ace';
import { args, flags } from '@adonisjs/core/ace';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export default class Frontend extends BaseCommand {
    static commandName = 'frontend';
    static description = 'Generate a new TSX file inside inertia/pages or inertia/Components';
    static options = {};
    async run() {
        const folder = this.type === 'pages'
            ? 'inertia/pages'
            : this.type === 'components'
                ? 'inertia/Components'
                : null;
        if (!folder) {
            this.logger.error('Tipe harus "pages" atau "components" BOS 🚨');
            return;
        }
        const rootPath = fileURLToPath(this.app.appRoot);
        const filePath = path.join(rootPath, folder, `${this.name}.tsx`);
        try {
            await fs.access(filePath);
            this.logger.warning(`File ${filePath} sudah ada ⚠️`);
            return;
        }
        catch {
        }
        const name = this.name.split('/')[1];
        const template = `
                    export default function ${name}() {
                      return (
                        <div>
                          <h1>${name} Component</h1>
                        </div>
                      )
                    }
                    `;
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, template, 'utf-8');
        this.logger.success(`Berhasil buat ${filePath}`);
    }
}
__decorate([
    args.string({ description: 'Nama file (tanpa ekstensi)' }),
    __metadata("design:type", String)
], Frontend.prototype, "name", void 0);
__decorate([
    flags.string({ description: 'Jenis: pages | components', alias: 't' }),
    __metadata("design:type", String)
], Frontend.prototype, "type", void 0);
//# sourceMappingURL=frontend.js.map