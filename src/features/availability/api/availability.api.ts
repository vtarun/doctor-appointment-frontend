import { axiosInstance } from "@/shared/api/axiosInstance"

export const availabilityApi = {
    getSlots: async (doctorId: string) => {
        const response = await axiosInstance.get(`/availability/${doctorId}`);
        return response.data;
    }
}