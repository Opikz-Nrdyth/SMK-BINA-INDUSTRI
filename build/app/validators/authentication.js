import vine from '@vinejs/vine';
export const Authentication = vine.compile(vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
    remember: vine.boolean().optional(),
}));
export const Register = vine.compile(vine.object({
    email: vine.string().email().normalizeEmail(),
    password: vine.string().minLength(6),
    fullName: vine.string(),
}));
//# sourceMappingURL=authentication.js.map