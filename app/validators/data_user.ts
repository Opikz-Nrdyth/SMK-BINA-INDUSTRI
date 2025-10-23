// File: validators/CreateUserValidator.ts
import vine from '@vinejs/vine'

// Validator untuk membuat user/super admin baru
export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255),

    email: vine.string().email().normalizeEmail().unique({
      table: 'users',
      column: 'email',
    }),

    password: vine.string().minLength(8).confirmed(),

    role: vine.string().optional(),
  })
)

// Validator untuk update user
export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().minLength(3).maxLength(255).optional(),

    email: vine.string().email().normalizeEmail().optional(),

    password: vine.string().minLength(8).confirmed().optional(),
  })
)

// Validator untuk reset password
export const resetPasswordValidator = vine.compile(
  vine.object({
    password: vine.string().minLength(8).confirmed(),
  })
)
