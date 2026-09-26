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
  verificationStatus: AppointmentStatus;
  consultationType: ConsultationType;
  videoSessionId?: string;
  doctorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export type PayoutStatus = 'PROCESSING' | 'PROCESSED' | 'REJECTED';

export interface PayoutRequest {
  _id: string;
  doctorId: string;
  paypalEmail: string;
  status: PayoutStatus;
  creditsRequested: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EarningsSummary {
  availableCredits: number;
  estimatedGrossAmount: number;
  estimatedFeeAmount: number;
  estimatedNetAmount: number;
  processingRequest: PayoutRequest | null;
  history: PayoutRequest[];
}

export interface PayoutRequestInput {
  paypalEmail: string;
  creditsRequested: number;
}

export type CreditTransactionType =
  | 'ALLOCATE'
  | 'BOOKING_DEBIT'
  | 'BOOKING_EARNING'
  | 'CANCELLATION_REFUND'
  | 'CANCELLATION_REVERSAL'
  | 'PAYOUT_DEDUC';

export interface CreditTransaction {
  _id: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  appointmentId?: string;
  createdAt: string;
}