import { axiosInstance } from "@/shared/api/axiosInstance";

export const doctorApi = {
    getMyProfile: async () => {
        const url = '/doctor/me';
        const response = await axiosInstance.get(url);
        return response.data;
    }
}