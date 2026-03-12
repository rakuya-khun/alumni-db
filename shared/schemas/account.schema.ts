import { z } from 'zod'

const ROLES = ['Dean', 'CE Chair', 'CpE Chair', 'EE Chair'] as const

export const accountSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, hyphens, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  role: z.enum(ROLES, { required_error: 'Role is required' }),
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(200),
  isActive: z.boolean().default(true),
})

export type AccountFormData = z.infer<typeof accountSchema>

export const accountUpdateSchema = accountSchema.partial({ password: true })

export type AccountUpdateData = z.infer<typeof accountUpdateSchema>
