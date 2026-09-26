export interface AvailabilityWindow {
  _id: string;
  doctorId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityWindowInput {
  startTime: string;
  endTime: string;
}

export interface Slot {
  startTime: string;
  endTime: string;
  status: "AVAILABLE" | "UNAVAILABLE";
}

export interface AvailabilityResponse {
  doctorId: string;
  from: string;
  to: string;
  appointmentDurationMinutes: number;
  windows: AvailabilityWindow[];
  slots: Slot[];
}