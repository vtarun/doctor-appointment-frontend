import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { appointmentApi } from "@/features/appointments/api/appointment.api";
import AppointmentCard from "@/features/appointments/components/AppointmentCard";
import { buttonListAppointmentStatus   } from "@/features/appointments/constants";

import queryClient from "@/shared/lib/queryClient";
import type { Appointment } from "@/shared/types";
import { useAuthStore } from "@/shared/store/authStore";
import { Link } from "react-router-dom";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";

type StatusFilter = Appointment['status'] | 'ALL';

const PatientDashboard = () => {    
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [cancelError, setCancelError] = useState<string>('');

  const {originalAppointmentList, isAppointmentsError, isAppointmentLoading} = useAppointments();

  

  const {mutate, isPending} = useMutation({
    mutationFn: (appointmentId: string) => appointmentApi.cancel(appointmentId),
    onSuccess: () => {
      setCancelError('');
      queryClient.invalidateQueries({queryKey: ['appointments']});
      queryClient.invalidateQueries({queryKey: ['transactions']});
    },
    onError: (error) => {
      setCancelError(error.message)
    }
  });

  const { user } = useAuthStore();

  const cancelAppointment = (appointmentId: string) => {
    setCancelError('');
    mutate(appointmentId);
  };

  const isNoAppointments = originalAppointmentList?.length === 0;
  
  const filteredAppointments = statusFilter === 'ALL' ? originalAppointmentList : originalAppointmentList?.filter((appointment: Appointment) => appointment.status === statusFilter);

  const isNoFilteredAppointments = filteredAppointments?.length === 0;

  if(isAppointmentLoading) return <p>Loading appointments...</p>

  if(isAppointmentsError) return <p>Error loading appointments list</p>

  return (
    <div>   
      <section className="section-dashboard">
        <div>
        <h2>Welcome back, {user?.name || "Vivek"} </h2>
        <p>Manage your appointments and consultations.</p>
        </div>
        <div>
          <button type='button'><Link to='/doctors'>Find a doctor<span></span></Link></button> 
        </div>
      </section>

      <div className='cards'>
          <WalletBalanceCard />

          <div className='card'>
            {/* TODO: Replace with appointment API data */}
            <p>Next appointment</p>
            <p><b>Today, 4:30 PM</b></p>
            <p>Video. Dr. Vijya nair</p>
          </div>
        </div>
  
      <section className="section-appointment">
        
        
        {cancelError && <p style={{color: 'red'}}>{cancelError}</p>}

        {/* Add filter to show speciefic appointments */}
        <div>
          <h3 style={{display: 'block', marginLeft: '25px'}}>My Appointments <span>{filteredAppointments?.length ?? 0} appointments</span></h3>
          <ul style={{display: 'flex', listStyle: 'none', gap: '20px' }}>
            {buttonListAppointmentStatus.map((status) => <li key={status} ><button onClick={() => setStatusFilter(status)} className={status === statusFilter ? 'active' : ''}>{status}</button></li>)}      
          </ul>
        </div>

        

        {isNoAppointments && <p>You do not have any appointments yet.</p>}

        {(!isNoAppointments && isNoFilteredAppointments) && <p>No {statusFilter} appointments found.</p>}
        
        {!isNoFilteredAppointments && filteredAppointments?.map((appointment: Appointment) => {
          return (<AppointmentCard key={appointment._id} appointment={appointment} cancel={() => cancelAppointment(appointment._id)} isCancelling={isPending}/>)
        })}
      </section>
    </div>
  )
}

export default PatientDashboard
