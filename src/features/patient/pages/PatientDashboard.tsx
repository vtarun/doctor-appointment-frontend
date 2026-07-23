import { appointmentApi } from "@/features/appointments/api/appointment.api";
import AppointmentCard from "@/features/appointments/components/AppointmentCard";
import queryClient from "@/shared/lib/queryClient";
import type { Appointment } from "@/shared/types";
import { useMutation, useQuery } from "@tanstack/react-query";

import { buttonListAppointmentStatus   } from "@/features/appointments/constants";
import { useState } from "react";

const PatientDashboard = () => {  
  const {data: originalAppointmentList, isError: isAppointmentsError, isLoading: isAppointmentLoading} = useQuery({
    queryKey: ['appointments'],
    queryFn: () => appointmentApi.getAllAppointments(),
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [cancelError, setCancelError] = useState<string>('');

  const appointmentList = statusFilter === 'ALL' ? originalAppointmentList : originalAppointmentList.filter((appointment: Appointment) => appointment.status === statusFilter);

  const {mutate, isPending} = useMutation({
    mutationFn: (appointmentId: string) => appointmentApi.cancel(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['appointments']});
      queryClient.invalidateQueries({queryKey: ['transactions']});
    },
    onError: (error) => {
      setCancelError(error.message)
    }
  });

  const cancelAppointment = (appointmentId: string) => {
    mutate(appointmentId);
  };

  if(isAppointmentLoading) return <p>Loading appointments...</p>

  if(isAppointmentsError) return <p>Error loading appointments list</p>

  if(!appointmentList || appointmentList?.length === 0) return <p>No Appointments found.</p>


  return (
    <div>      
      <section className="appointment-section">
        
        {isAppointmentsError && <p>Error loading appointments list</p>}
        
        
        {/* Add filter to show speciefic appointments */}
        {cancelError && <p style={{color: 'red'}}>{cancelError}</p>}

        <div>
          <ul style={{display: 'flex', listStyle: 'none', gap: '20px' }}>
            {buttonListAppointmentStatus.map((status: string) => <li key={status} ><button onClick={() => setStatusFilter(status)}>{status}</button></li>)}      
          </ul>
        </div>
        {}
        {/* List patients all appointments. Group them according to status */}
        {appointmentList?.map((appointment: Appointment) => {
          return (<AppointmentCard key={appointment._id} appointment={appointment} cancel={cancelAppointment}/>)
        })}
      </section>
      
      {/* Show latest appointments from each category in the list */}
    </div>
  )
}

export default PatientDashboard
