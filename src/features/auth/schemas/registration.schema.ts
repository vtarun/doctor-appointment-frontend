import z from "zod";

export const registrationSchema = z.object({
    name: z.string().min(3, 'User name must be atleast 3 character long'),
    email: z.email('Invalid email'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER'] as const, {
        error: () => ({ message: 'Please select a gender'})
    }),
    dateOfBirth: z.iso.date({
        error: 'Please select valid date of birth'
    }),
    password: z.string()
        .min(6, 'Password must be atleast 6 character long')
        .max(15, "Password can't be more than 15 character long")
        .regex(/[a-z]/, 'Password must contain at least one lowercase character')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase character')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^a-zA-Z0-9]/, 'Password must contain special character'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword , {
    message: "Password didn't match",
    path:['confirmPassword']
})
.transform(({ confirmPassword, ...rest }) => rest);

export type registrationInput = z.input<typeof registrationSchema>
export type registrationOutput = z.output<typeof registrationSchema>