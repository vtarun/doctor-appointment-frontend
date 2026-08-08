export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  onboarding: "/onboarding",
  unauthorized: "/unauthorized",
  admin: {
    root: "/admin",
    doctors: "/admin/doctors",
    doctorDetails: "/admin/doctors/:doctorId",
  },
  doctor: {
    root: "/doctor",
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
