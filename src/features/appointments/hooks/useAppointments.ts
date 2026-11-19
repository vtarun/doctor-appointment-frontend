import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/queryKeys";
import { useAuthStore } from "@/shared/store/authStore";
import type { Appointment } from "@/shared/types";
import type { DoctorAppointment } from "@/features/doctor/types";
import { appointmentApi } from "../api/appointment.api";

type RoleAppointments = { patient: Appointment; doctor: DoctorAppointment };

export function useAppointments<Role extends keyof RoleAppointments>(role: Role) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery<RoleAppointments[Role][]>({
    queryKey: [...queryKeys.appointments, userId, role],
    queryFn: appointmentApi.getAllAppointments,
  });
}
