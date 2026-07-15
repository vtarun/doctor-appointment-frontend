import { axiosInstance } from "@/shared/api/axiosInstance";

export const authApi = {
    getMe: async () => {
        const response = await axiosInstance.get('/auth/me');
        return response.data;
    },
}