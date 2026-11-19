import { z } from 'zod'
import { specialties } from '@/features/patient/constants/specialities'

export const personalInfoSchema = z.object({
    fullname: z.string().trim()
        .min(3, "Full name must be at least 3 characters")
        .max(15, "Full name must be at most 15 characters"),
    dateOfBirth: z.iso.date({
        error: () => ({ message: "Please select a date of birth"})
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']as const, {
        error: () => ({ message: 'Please select a gender'})
    })
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;


export const credentialSchema = z.object({
    speciality: z.enum(specialties.map(({ slug }) => slug), {
        error: "Select a supported specialty"
    }),
    totalExperience: z.coerce.number()
        .int("Experience must be a whole number of years")
        .min(0, "Experience cannot be negative"),
    qualification: z.enum(['MBBS', 'MS', 'MD'] as const, {
        error: () => ({ message: 'Please select a qualification'})
    }),
    credential: z.instanceof(File, { error: "Upload a credential file" })
        .refine(file => file.size < 2 * 1024 * 1024, { message: "File must be under 2 MB" })
        .refine(file => ['application/pdf', 'image/jpeg', 'image/jpg'].includes(file.type), { message: "Upload a PDF or JPEG file" })
});

export type CredentialFormData = z.infer<typeof credentialSchema>;


export const practiceDetailsSchema = z.object({
    clinicName: z.string().trim()
        .min(3, "Clinic name must be at least 3 characters")
        .max(15, "Clinic name must be at most 15 characters"),
    city: z.string().trim()
        .min(3, "City must be at least 3 characters")
        .max(15, "City must be at most 15 characters"),
    bio: z.string().trim()
        .min(10, "Bio must be at least 10 characters")
        .max(1000, "Bio must be at most 1,000 characters"),
    consultationType: z.enum(['ONLINE', 'IN_PERSON', 'BOTH'], {
        error: "Select a consultation type"
    }),
    consultationFee: z.coerce.number().min(0, 'Fee can not be negative').pipe(z.number())
});

export type PracticeDetailsFormData = z.infer<typeof practiceDetailsSchema>;

export const onboardingSchema = z.object({
    ...personalInfoSchema.shape,
    ...credentialSchema.shape,
    ...practiceDetailsSchema.shape
});


// export type OnboardingFormData = z.infer<typeof onboardingSchema>;   

export type OnboardingFormInput =
  z.input<typeof onboardingSchema>;

export type OnboardingFormData =
  z.output<typeof onboardingSchema>;
