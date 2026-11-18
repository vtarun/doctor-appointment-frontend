import { axiosInstance } from "@/shared/api/axiosInstance";
import type { LoginFormData } from "../schemas/login.schema";
import type { registrationOutput } from "../schemas/registration.schema";
import type { OnboardingFormData } from "../schemas/onboarding.schema";

export const authApi = {
    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },
    login: async (data: LoginFormData) => {
        const response = await axiosInstance.post('/auth/login', data );
        return response.data;
    },
    register: async(data: registrationOutput) => {
        const response = await axiosInstance.post('/auth/register', data);
        return response.data;
    },
    onboardPatient: async() => {
        const response = await axiosInstance.post('/auth/onboard/patient',{});
        return response.data;
    },
    
    onboardDoctor: async (data: OnboardingFormData) => {
        const form = new FormData();

        form.append("fullname", data.fullname);
        form.append("dateOfBirth", data.dateOfBirth);
        form.append("gender", data.gender);
        form.append("speciality", data.speciality);
        form.append("totalExperience", String(data.totalExperience));
        form.append("qualification", data.qualification);
        form.append("bio", data.bio);
        form.append("clinicName", data.clinicName);
        form.append("city", data.city);
        form.append("consultationType", data.consultationType);
        form.append("consultationFee", String(data.consultationFee));
        form.append("credential", data.credential);

        const response = await axiosInstance.post("/auth/onboard/doctor", form);

        return response.data;
    },
}