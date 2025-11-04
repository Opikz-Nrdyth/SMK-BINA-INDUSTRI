import BankSoal from '#models/bank_soal';
import DataPassword from '#models/data_password';
export default class DataPasswordsController {
    async index({ request, inertia, session }) {
        const page = request.input('page', 1);
        const search = request.input('search', '');
        const query = DataPassword.query();
        if (search) {
            query.where('kode', 'LIKE', `%${search}%`);
        }
        const paginate = await query.orderBy('id', 'desc').paginate(page, 15);
        const passwords = paginate.all().map((item) => item.toJSON());
        const startNumber = (page - 1) * 15 + 1;
        const processed = passwords.map((d, index) => ({
            ...d,
            ujian: d.ujian,
            nomor: startNumber + index,
        }));
        const bankSoals = await BankSoal.query().select(['id', 'namaUjian', 'mapelId']).preload('mapel');
        const data = processed.map((d) => {
            const ujianNames = d.ujian
                .map((id) => {
                const b = bankSoals.find((x) => x.id === id);
                return b ? b.namaUjian : `#${id}`;
            })
                .join(', ');
            const ujian = d.ujian.map((id) => {
                const b = bankSoals.find((x) => x.id === id);
                return { mapel: b?.mapel.namaMataPelajaran, jenjang: b?.mapel.jenjang };
            });
            return { ...d, ujianNames, mapel: ujian[0].mapel, jenjang: ujian[0].jenjang };
        });
        return inertia.render('DataPasswords/Index', {
            dataPasswords: data,
            bankSoals,
            session: session.flashMessages.all(),
            searchQuery: search,
            pagination: {
                currentPage: paginate.currentPage,
                lastPage: paginate.lastPage,
                total: paginate.total,
                perPage: paginate.perPage,
                nextPage: paginate.currentPage < paginate.lastPage ? paginate.currentPage + 1 : null,
                previousPage: paginate.currentPage > 1 ? paginate.currentPage - 1 : null,
            },
        });
    }
    async store({ request, response }) {
        const { password, ujian } = request.only(['password', 'ujian']);
        DataPassword.create({
            kode: password,
            ujian: ujian,
        });
        return response.redirect().back();
    }
    async update({ params, request, response }) {
        const { password, ujian } = request.only(['password', 'ujian']);
        const data = await DataPassword.findOrFail(params.id);
        data.kode = password;
        data.ujian = ujian;
        await data.save();
        return response.redirect().back();
    }
    async destroy({ params, response }) {
        const data = await DataPassword.findOrFail(params.id);
        await data.delete();
        return response.redirect().back();
    }
}
//# sourceMappingURL=data_passwords_controller.js.map