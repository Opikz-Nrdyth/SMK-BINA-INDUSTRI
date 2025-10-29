import vine from '@vinejs/vine';
export const createUserValidator = vine.compile(vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),
    email: vine.string().email().normalizeEmail().unique({
        table: 'users',
        column: 'email',
    }),
    password: vine.string().minLength(8).confirmed(),
    role: vine.string().optional(),
}));
export const updateUserValidator = vine.compile(vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255).optional(),
    email: vine.string().email().normalizeEmail().optional(),
    password: vine.string().minLength(8).confirmed().optional(),
}));
export const resetPasswordValidator = vine.compile(vine.object({
    password: vine.string().minLength(8).confirmed(),
}));
//# sourceMappingURL=data_user.js.map