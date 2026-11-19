export const queryKeys = {
  appointments: ['appointments', 'me'],
  appointmentDetails: ['appointment-detail'],
  appointmentDetail: (userId: string | undefined, appointmentId: string) => ['appointment-detail', userId, appointmentId] as const,
  wallet: ['wallet'],
  transactions: ['transactions'],
  payoutSummary: ['payouts', 'me', 'summary'],
  slots: ['slots'],
  doctorAvailability: ['doctor-availability'],
  adminPendingDoctors: ['admin', 'doctors', 'pending'],
  adminDoctorApplication: (doctorId: string) => ['admin', 'doctors', 'application', doctorId] as const,
} as const;
