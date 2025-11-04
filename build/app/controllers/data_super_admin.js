import User from '#models/user';
import { createUserValidator } from '#validators/data_user';
import logger from '@adonisjs/core/services/logger';
export default class SuperAdminController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const limit = request.input('limit', 15);
        const search = request.input('search', '');
        const query = User.query().where('role', 'SuperAdmin');
        if (search) {
            query.where((builder) => {
                builder.where('fullName', 'ILIKE', `%${search}%`).orWhere('email', 'ILIKE', `%${search}%`);
            });
        }
        const users = await query.orderBy('created_at', 'desc').paginate(page, limit);
        return inertia.render('ManajemenWebsite/SuperAdmin', {
            users: users.serialize().data,
            userPaginate: users.serialize().meta,
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async store({ request, response, session }) {
        try {
            const data = await request.validateUsing(createUserValidator);
            await User.create({
                ...data,
                role: 'SuperAdmin',
            });
            session.flash({
                status: 'success',
                message: 'Super Admin berhasil ditambahkan.',
            });
            return response.redirect().withQs().back();
        }
        catch (error) {
            logger.error({ err: error }, 'Gagal menyimpan data Super Admin baru');
            session.flash({
                status: 'error',
                message: 'Gagal menyimpan data Super Admin',
                error: error,
            });
            return response.redirect().withQs().back();
        }
    }
    async destroy({ params, response, auth, session }) {
        try {
            const user = await User.findOrFail(params.id);
            await auth.check();
            const authUser = auth.user;
            if (user.id == authUser.id) {
                session.flash({
                    status: 'error',
                    message: 'Super admin utama tidak dapat dihapus',
                });
                return response.redirect().withQs().back();
            }
            await user.delete();
            session.flash({
                status: 'success',
                message: 'Super Admin berhasil dihapus.',
            });
        }
        catch (error) {
            logger.error({ err: error }, `Gagal hapus data Super Admin`);
            session.flash({
                status: 'error',
                message: 'Gagal menghapus data Super Admin',
                error: error,
            });
        }
        return response.redirect().withQs().back();
    }
}
//# sourceMappingURL=data_super_admin.js.map