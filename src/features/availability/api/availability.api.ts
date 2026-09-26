import { axiosInstance } from "@/shared/api/axiosInstance"

export const availabilityApi = {
    getSlots: async (doctorId: string, from: string, to: string) => {
        const response = await axiosInstance.get(`/availability/${doctorId}?from=${from}&to=${to}`);
        return response.data;
    },
    createWindow: async (window: Object) => {
        const response = await axiosInstance.post('/availability', window);
        return response.data;
    },
    removeRange: async (window: Object) => {
        const response = await axiosInstance.delete('/availability', window);
        return response.data;
    }, 
}