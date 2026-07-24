import type { UserRoleType } from "../types"

interface NavbarLink{
    to: string,
    label: string
}

export const NavbarRoleBasedLinks: Record<UserRoleType, NavbarLink[]> = {
    PATIENT: [
        { to: "/patient", label: "Dashboard" },
        { to: "/doctors", label: "Find Doctors" },
    ],
    DOCTOR: [
        { to: "/doctor", label: "Dashboard" },
    ],
    ADMIN: [
        { to: "/admin", label: "Dashboard" },
        { to: "/admin/doctors", label: "Doctor Requests" },
    ],
}