import { axiosInstance } from "@/shared/api/axiosInstance";
import type { LoginFormData } from "../schemas/login.schema";

export const authApi = {
    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },
    login: async (data: LoginFormData) => {
        const response = await axiosInstance.post('/login', data );
        return response.data;
    },
}