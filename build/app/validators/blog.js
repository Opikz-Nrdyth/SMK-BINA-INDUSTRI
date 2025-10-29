import vine from '@vinejs/vine';
export const blogValidator = vine.compile(vine.object({
    judul: vine.string(),
    slug: vine.string().optional(),
    konten: vine.string(),
    ringkasan: vine.string().optional(),
    thumbnail: vine.any().optional(),
    status: vine.enum(['draft', 'published', 'archived']),
    kategori: vine.string().optional(),
    tags: vine.string().optional(),
}));
//# sourceMappingURL=blog.js.map