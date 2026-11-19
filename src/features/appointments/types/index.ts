import type { Appointment } from "@/shared/types";

export interface AppointmentParticipant {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  subtitle?: string;
}

export interface AppointmentDetails extends Pick<Appointment, "_id" | "startTime" | "endTime" | "status" | "consultationType" | "doctorNotes"> {
  doctor: AppointmentParticipant;
  patient: AppointmentParticipant;
  issueNote?: string;
}

export interface BookAppointmentRequest{
    doctorId: string,
    startTime: string,
    endTime: string,
    consultationType: 'IN_PERSON' | 'VIDEO',
    issueNote?: string
}
