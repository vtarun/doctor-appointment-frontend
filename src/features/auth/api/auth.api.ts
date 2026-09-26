import { axiosInstance } from "@/shared/api/axiosInstance";
import type { LoginFormData } from "../schemas/login.schema";
import type { registrationOutput } from "../schemas/registration.schema";

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
    }
}