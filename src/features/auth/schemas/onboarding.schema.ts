import { z } from 'zod'

export const personalInfoSchema = z.object({
    fullname: z.string()
        .min(3, "Minimun 3 characters required")
        .max(15 , 'Maximun 15 characters are allowed'),
    dateOfBirth: z.iso.date({
        error: () => ({ message: "Please select a date of birth"})
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']as const, {
        error: () => ({ message: 'Please select a gender'})
    })
});

export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;


export const credentialSchema = z.object({
    speciality: z.string()
        .min(1, "Pleae select fron dropdown"),
    totalExperience: z.coerce.number()
        .min(0, 'Experience can not be negative').pipe(z.number()),
    qualification: z.enum(['MBBS', 'MS', 'MD', 'GOD'] as const, {
        error: () => ({ message: 'Please select a qualification'})
    }),
    credential: z.instanceof(File)        
        .refine(file => file.size <= 2 * 1024 *1024, { message: 'File must be under 2MB'})
        .refine(file => ['application/pdf', 'image/jpeg', 'image/jpg'].includes(file.type), {message: 'PDF or JPEG or JPG only' })        
});

export type CredentialFormData = z.infer<typeof credentialSchema>;


export const practiceDetailsSchema = z.object({
    clinicName: z.string()
        .min(3, "Minimun 6 characters required")
        .max(15 , 'Maximun 15 characters are allowed'),
    city: z.string()
        .min(3, 'Please enter valid city name')
        .max(15 , 'Maximun 15 characters are allowed'),
    consultationType: z.enum(['ONLINE' , 'IN_PERSON' , 'BOTH']),
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
