import { axiosInstance } from "@/shared/api/axiosInstance"
import type { BookAppointmentRequest } from "../types";

interface CancelAppointmentRequest {
  appointmentId: string;
  reason: string;
}

export const appointmentApi = {
    book: async (data: BookAppointmentRequest) => {
        const response = await axiosInstance.post('/appointments', data);
        return response.data;
    },
    cancel: async ({appointmentId, reason}: CancelAppointmentRequest) => {
        const response = await axiosInstance.post(`/appointments/${appointmentId}/cancel`, {reason});
        return response.data;
    },
    complete: async (appointmentId: string) => {
        const response = await axiosInstance.post(`/appointments/${appointmentId}/complete`);
        return response.data;
    },
    getAllAppointments: async () => {
        const response = await axiosInstance.get('/appointments/me');
        return response.data;
    }
}