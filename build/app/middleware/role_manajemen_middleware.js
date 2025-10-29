import DataGuru from '#models/data_guru';
import DataKelas from '#models/data_kelas';
import DataStaf from '#models/data_staf';
import User from '#models/user';
export default class RoleManajemenMiddleware {
    async handle(ctx, next, allowedRoles) {
        const user = ctx.auth.user;
        if (!user) {
            return ctx.response.redirect('/login');
        }
        const activeRole = ctx.session.get('role') || user.role;
        let isWaliKelas = false;
        if (activeRole === 'Guru') {
            try {
                const guru = await DataGuru.query().where('userId', user.id).first();
                if (guru) {
                    const kelasWali = await DataKelas.query().where('waliKelas', guru.nip).first();
                    isWaliKelas = !!kelasWali;
                }
            }
            catch (error) {
                console.error('Error checking wali kelas:', error);
                isWaliKelas = false;
            }
        }
        const userData = await User.query()
            .where('id', user.id)
            .preload('dataGuru')
            .preload('dataStaf')
            .firstOrFail();
        const isMultipleAccount = !!(userData.dataGuru && userData.dataStaf);
        let dataStaf;
        if (activeRole == 'Staf') {
            dataStaf = await DataStaf.query().where('user_id', user?.id).first();
        }
        const pageName = ctx.route?.name;
        const pattern = ctx.route?.pattern;
        ctx.inertia.share({
            user,
            route: pageName || '-',
            pattern: pattern || '',
            isWaliKelas,
            departement: dataStaf?.departemen || '',
            activeRole,
            isMultipleAccount,
        });
        if (!allowedRoles.includes(activeRole)) {
            switch (activeRole) {
                case 'SuperAdmin':
                    return ctx.response.redirect('/SuperAdmin');
                case 'Guru':
                    return ctx.response.redirect('/guru');
                case 'Siswa':
                    return ctx.response.redirect('/siswa');
                case 'Staf':
                    return ctx.response.redirect('/staf');
                default:
                    return ctx.response.redirect('/login');
            }
        }
        await next();
    }
}
//# sourceMappingURL=role_manajemen_middleware.js.map