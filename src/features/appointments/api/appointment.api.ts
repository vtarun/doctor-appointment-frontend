import { axiosInstance } from "@/shared/api/axiosInstance"
import type { BookAppointmentRequest } from "../types";

export const appointmentApi = {
    book: async (data: BookAppointmentRequest) => {
        const response = await axiosInstance.post('/appointments', data);
        return response.data;
    }
}