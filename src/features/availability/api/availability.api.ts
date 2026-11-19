import { axiosInstance } from "@/shared/api/axiosInstance"

import type { AvailabilityResponse } from "../types";

export const availabilityApi = {
    getSlots: async (doctorId: string, from: string, to: string) => {
        const response = await axiosInstance.get<AvailabilityResponse>(`/availability/${encodeURIComponent(doctorId)}`, { params: { from, to } });
        return response.data;
    },
    createWindow: async (window: object) => {
        const response = await axiosInstance.post('/availability', window);
        return response.data;
    },
    removeRange: async (window: object) => {
        const response = await axiosInstance.delete('/availability', window);
        return response.data;
    }, 
}
