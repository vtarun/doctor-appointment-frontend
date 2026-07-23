import { axiosInstance } from "@/shared/api/axiosInstance"
import type { BookAppointmentRequest } from "../types";

export const appointmentApi = {
    book: async (data: BookAppointmentRequest) => {
        const response = await axiosInstance.post('/appointments', data);
        return response.data;
    },
    cancel: async (appointmentId: string) => {
        const response = await axiosInstance.post(`/appointments/${appointmentId}/cancel`);
        return response.data;
    },
    update: async (appointmentId: string) => {
        const response = await axiosInstance.post(`/appointments/${appointmentId}/complete`);
        return response.data;
    },
    getAllAppointments: async () => {
        const response = await axiosInstance.get('/appointments/me');
        return response.data;
    }
}