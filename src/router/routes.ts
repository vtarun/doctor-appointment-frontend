export const ROUTES = {
  home: "/",
  login: "/login",
  account: "/account",
  videoCall: "/video-call",
  register: "/register",
  onboarding: "/onboarding",
  unauthorized: "/unauthorized",
  admin: {
    root: "/admin",
    doctors: "/admin/doctors",
    verified: "/admin/verified",
    payouts: "/admin/payouts",
    doctorDetails: "/admin/doctors/:doctorId",
  },
  doctor: {
    root: "/doctor",
    appointmentDetails: "/doctor/appointments/:appointmentId",
  },
  patient: {
    root: "/patient",
    appointments: "/patient/appointments",
    wallet: "/patient/wallet",
    doctors: "/patient/doctors",
    doctorList: "/patient/doctors/:speciality",
    doctorDetails: "/patient/doctors/:speciality/:doctorId",
  },
} as const;
