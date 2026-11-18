import { axiosInstance } from "@/shared/api/axiosInstance";

export const doctorApi = {
    getMyProfile: async () => {
        const url = '/doctors/me';
        const response = await axiosInstance.get(url);
        return response.data;
    }
}