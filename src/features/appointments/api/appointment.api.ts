import { axiosInstance } from "@/shared/api/axiosInstance"
import type { AppointmentDetails, BookAppointmentRequest } from "../types";

interface CancelAppointmentRequest {
  appointmentId: string;
  reason: string;
}

export const appointmentApi = {
    detail: async (id: string) => {
        const response = await axiosInstance.get<AppointmentDetails>(`/appointments/${encodeURIComponent(id)}`);
        return response.data;
    },
    saveNotes: async (id: string, doctorNotes: string) => {
        const response = await axiosInstance.patch<{ doctorNotes: string }>(`/appointments/${encodeURIComponent(id)}/notes`, { doctorNotes });
        return response.data;
    },
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
