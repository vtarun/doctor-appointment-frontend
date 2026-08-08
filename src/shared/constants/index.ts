import type { UserRoleType } from "../types"
import { ROUTES } from "@/router/routes";

interface NavbarLink {
  to: string;
  label: string;
}

export const NavbarRoleBasedLinks: Record<UserRoleType, NavbarLink[]> = {
  PATIENT: [
    { to: ROUTES.patient.root, label: "Dashboard" },
    { to: ROUTES.patient.doctors, label: "Find Doctors" },
    // { to: ROUTES.patient.appointments, label: "Appointments" },
    { to: ROUTES.patient.wallet, label: "Wallet" },
  ],
  DOCTOR: [
    { to: ROUTES.doctor.root, label: "Dashboard" },
  ],
  ADMIN: [
    { to: ROUTES.admin.root, label: "Dashboard" },
    { to: ROUTES.admin.doctors, label: "Doctor Requests" },
  ],
};