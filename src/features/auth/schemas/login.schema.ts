import * as z from 'zod';

export const loginSchema = z.object({
    email: z.email('Invalid email'),
    password: z.string().min(6, 'Minimum 6 characters required.').max(16, 'Maximum 16 characters are allowed.')
});

export type LoginFormData = z.infer<typeof loginSchema>;