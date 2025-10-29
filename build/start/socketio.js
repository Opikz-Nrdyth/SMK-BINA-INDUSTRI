import ws_service from '#services/ws_service';
import app from '@adonisjs/core/services/app';
app.ready(() => {
    ws_service.boot();
});
//# sourceMappingURL=socketio.js.map