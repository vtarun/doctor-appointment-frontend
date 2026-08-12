// doctor --> types -- index.ts
export interface Speciality {
  name: string;
  slug: string;
  icon: string;
}
 
export type AppointmentStatus =
  | "BOOKED"
  | "COMPLETED"
  | "CANCELLED";

export type ConsultationType =
  | "IN_PERSON"
  | "VIDEO";

export interface DoctorAppointment {
  _id: string;

  patientId: {
    _id: string;
    gender?: "MALE" | "FEMALE" | "OTHER";
    dateOfBirth?: string;
    profileImageUrl?: string;
    userId: {
      _id: string;
      name: string;      
    };
  };

  issueNote?: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  consultationType: ConsultationType;
  videoSessionId?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
}