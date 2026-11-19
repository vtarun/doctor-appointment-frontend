import { axiosInstance } from "@/shared/api/axiosInstance";

import type { Doctor } from "@/shared/types";
import type { BookAppointmentRequest } from "@/features/appointments/types";

type Consultation = BookAppointmentRequest["consultationType"];

interface BookableDoctor extends Omit<Doctor, "userId"> {
  userId: Doctor["userId"] & { avatarUrl?: string | null };
  profileImageUrl?: string | null;
  bio?: string;
  clinicName?: string;
  city?: string;
  consultationType?: "ONLINE" | "VIDEO" | "IN_PERSON" | "BOTH";
  bookingCosts?: Partial<Record<Consultation, { amount: number; unit: string }>>;
}

export const doctorsApi = {
    getDoctors: async (speciality?: string) => {
        const url = speciality ? `/doctors?speciality=${speciality}` : '/doctors';
        const response = await axiosInstance.get(url);
        return response.data;
    },

    getDoctorById: async (id: string) => {
        const response = await axiosInstance.get<BookableDoctor>(`/doctors/${encodeURIComponent(id)}`);
        return response.data;
  }
}
