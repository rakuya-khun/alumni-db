import { z } from 'zod'

export const emailComposeSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject must be 200 characters or less'),
  body: z.string().min(1, 'Email body is required'),
  includeGformLink: z.boolean().default(false),
})

export type EmailComposeData = z.infer<typeof emailComposeSchema>
