import { mockAppointments } from "@/mock-data";
import type { Appointment } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";

export const useAppointments = () => {
    const {data: originalAppointmentList, isError: isAppointmentsError, isLoading: isAppointmentLoading} = useQuery({
        queryKey: ['appointments'],
        queryFn: () => mockAppointments as Appointment[]//appointmentApi.getAllAppointments(),  //TODO:
    });

    return {originalAppointmentList, isAppointmentsError, isAppointmentLoading};
}