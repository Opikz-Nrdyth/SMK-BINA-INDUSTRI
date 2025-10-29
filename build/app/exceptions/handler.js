import app from '@adonisjs/core/services/app';
import { ExceptionHandler } from '@adonisjs/core/http';
export default class HttpExceptionHandler extends ExceptionHandler {
    debug = !app.inProduction;
    renderStatusPages = app.inProduction;
    statusPages = {
        '404': (error, { inertia }) => inertia.render('errors/not_found', { error }),
        '500..599': (error, { inertia }) => inertia.render('errors/server_error', { error }),
    };
    async handle(error, ctx) {
        return super.handle(error, ctx);
    }
    async report(error, ctx) {
        return super.report(error, ctx);
    }
}
//# sourceMappingURL=handler.js.map