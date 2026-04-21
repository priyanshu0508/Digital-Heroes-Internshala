import { z } from 'zod'

// Regex for names: Only letters, spaces, and hyphens
const nameRegex = /^[a-zA-Z\s-]+$/

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const signupSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name is too long')
    .regex(nameRegex, 'First name can only contain letters, spaces, and hyphens'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name is too long')
    .regex(nameRegex, 'Last name can only contain letters, spaces, and hyphens'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  charityId: z.string().uuid('Please select a valid charity'),
  charityPct: z.coerce
    .number()
    .min(10, 'Minimum contribution is 10%')
    .max(100, 'Maximum contribution is 100%')
    .default(10),
  plan: z.enum(['monthly', 'yearly'], {
    message: "Please select a valid subscription plan"
  }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
