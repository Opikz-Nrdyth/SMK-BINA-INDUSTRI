import DataGuru from '#models/data_guru';
export default class DataWaliKelasController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const [totalWaliKelas] = await Promise.all([
            DataGuru.query().has('waliKelas').count('* as total').first(),
        ]);
        const query = DataGuru.query()
            .select(['nip', 'userId', 'gelarDepan', 'gelarBelakang', 'jenisKelamin'])
            .preload('user')
            .preload('waliKelas')
            .has('waliKelas');
        if (search) {
            query.where((builder) => {
                builder
                    .where('nip', 'LIKE', `%${search}%`)
                    .orWhereHas('user', (userQuery) => {
                    userQuery
                        .where('full_name', 'LIKE', `%${search}%`)
                        .orWhere('email', 'LIKE', `%${search}%`);
                })
                    .orWhere('jenis_kelamin', 'LIKE', `%${search}%`)
                    .orWhereHas('waliKelas', (waliQuery) => {
                    waliQuery.where('nama_kelas', 'LIKE', `%${search}%`);
                });
            });
        }
        const waliKelasPaginate = await query
            .orderBy('createdAt', 'desc')
            .paginate(page, search ? Number(totalWaliKelas?.$extras.total) || 1 : 15);
        return inertia.render('WaliKelas/Index', {
            waliKelasPaginate: {
                currentPage: waliKelasPaginate.currentPage,
                lastPage: waliKelasPaginate.lastPage,
                total: waliKelasPaginate.total,
                perPage: waliKelasPaginate.perPage,
                firstPage: 1,
                nextPage: waliKelasPaginate.currentPage < waliKelasPaginate.lastPage
                    ? waliKelasPaginate.currentPage + 1
                    : null,
                previousPage: waliKelasPaginate.currentPage > 1 ? waliKelasPaginate.currentPage - 1 : null,
            },
            waliKelas: waliKelasPaginate.all().map((item) => item.toJSON()),
            session: session.flashMessages.all(),
            searchQuery: search,
        });
    }
    async create({ inertia, session }) {
        return inertia.render('WaliKelas/Create', {
            session: session.flashMessages.all(),
        });
    }
    async edit({ inertia, params, session }) {
        const waliKelas = await DataGuru.query()
            .where('nip', params.id)
            .preload('user')
            .preload('waliKelas')
            .firstOrFail();
        return inertia.render('WaliKelas/Edit', {
            waliKelas,
            session: session.flashMessages.all(),
        });
    }
}
//# sourceMappingURL=data_wali_kelas_controller.js.map