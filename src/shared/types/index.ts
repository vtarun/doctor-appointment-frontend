export type UserRoleType = 'PATIENT'| 'DOCTOR'| 'ADMIN';
export interface User{
    id: string,
    name: string,
    email: string,
    dob: Date,
    gender: string,
    role: UserRoleType,
    createdAt: string,
    updatedAt: string
}

export interface Appointment{
    _id: string,
    doctorId: {
      _id: string,
      speciality: string,
      userId: {
        _id: string,
        name: string
      }
    },
    patientId: string,
    startTime: string,
    endTime: string,
    status: 'BOOKED' | 'COMPLETED' | 'CANCELLED',
    consultationType: 'IN_PERSON'| 'VIDEO',
    videoSessionId?: string,
    doctorNotes?: string,
    createdAt: string,
    updatedAt: string
}

export type TransactionType =
  | "ALLOCATE"
  | "BOOKING_DEBIT"
  | "BOOKING_EARNING"
  | "CANCELLATION_REFUND"
  | "CANCELLATION_REVERSAL"
  | "PAYOUT_DEDUCTION";

export interface Transaction {
  _id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  appointmentId?: string;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor{
  _id: string,
    userId: {
      _id: string,
      name: string,
      email: string
    },
    speciality : string,
    experienceYears: number,
    // qualification: string,   
    verificationStatus: 'PENDING'| 'VERIFIED'| 'REJECTED',
    credentials: string[],
    createdAt: string,
    updatedAt: string
}