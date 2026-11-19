import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import NextAppointment from "@/features/appointments/components/NextAppointment";
import AppointmentCard from "@/features/appointments/components/AppointmentCard";
import { buttonListAppointmentStatus   } from "@/features/appointments/constants";

import { appointmentApi } from "@/features/appointments/api/appointment.api";
import { invalidateAppointmentQueries } from "@/features/appointments/api/invalidateAppointmentQueries";
import type { Appointment } from "@/shared/types";
import { useAuthStore } from "@/shared/store/authStore";
import { Link, useLocation } from "react-router-dom";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";

import CancellationModal from "@/features/appointments/components/CancellationModal";

type StatusFilter = Appointment['status'] | 'ALL';

const PatientDashboard = () => {    
  const { hash } = useLocation();
  useEffect(() => {
    if (hash === "#dashboard-appointments") {
      const section = document.getElementById("dashboard-appointments");
      section?.focus({ preventScroll: true });
      section?.scrollIntoView();
    }
  }, [hash]);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [cancelError, setCancelError] = useState<string>('');
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  const appointments = useAppointments('patient');
  const { data: originalAppointmentList, isError: isAppointmentsError, isLoading: isAppointmentLoading } = appointments;

  

  const {mutate, isPending} = useMutation({
    mutationFn: (request: Parameters<typeof appointmentApi.cancel>[0]) => appointmentApi.cancel(request),
    onSuccess: () => {
      setCancelError('');
      setAppointmentToCancel(null);
      setCancellationReason('');
      void invalidateAppointmentQueries();
    },
    onError: (error) => {
      setCancelError(error.message)
    }
  });

  const { user } = useAuthStore();

  const cancelAppointment = (appointmentId: string) => {
    setCancelError('');
    setCancellationReason('');
    setAppointmentToCancel(appointmentId);
  };

  const isNoAppointments = originalAppointmentList?.length === 0;
  
  const filteredAppointments = statusFilter === 'ALL' ? originalAppointmentList : originalAppointmentList?.filter((appointment: Appointment) => appointment.status === statusFilter);

  const isNoFilteredAppointments = filteredAppointments?.length === 0;



  return (
    <div>   
      <section className="section-dashboard">
        <div>
        <h2>Welcome back, {user?.name || "Vivek"} </h2>
        <p>Manage your appointments and consultations.</p>
        </div>
        <div>
          <Link to="doctors">Find a doctor</Link>
        </div>
      </section>

      <div className="grid gap-6 px-4 lg:grid-cols-2">
          <WalletBalanceCard detailsPath="wallet" />

          <NextAppointment
              appointments={originalAppointmentList}
              isLoading={appointments.isPending || (isAppointmentsError && appointments.isFetching)}
              isError={isAppointmentsError}
              retry={() => void appointments.refetch()}
              role="patient"
            />
        </div>
  
      <section id="dashboard-appointments" tabIndex={-1} className="section-appointment scroll-mt-24">
        
        
        {cancelError && <p style={{color: 'red'}}>{cancelError}</p>}

        {/* Add filter to show speciefic appointments */}
        <div>
          <h3 style={{display: 'block', marginLeft: '25px'}}>My Appointments <span>{filteredAppointments?.length ?? 0} appointments</span></h3>
          <ul style={{display: 'flex', listStyle: 'none', gap: '20px', flexWrap: 'wrap' }}>
            {buttonListAppointmentStatus.map((status) => <li key={status} ><button onClick={() => setStatusFilter(status)} className={status === statusFilter ? 'active' : ''}>{status}</button></li>)}      
          </ul>
        </div>

        

        {isAppointmentLoading && <p role="status">Loading appointments...</p>}
        {isAppointmentsError && <p role="alert">Unable to load appointments.</p>}
        {isNoAppointments && <p>You do not have any appointments yet.</p>}

        {(!isNoAppointments && isNoFilteredAppointments) && <p>No {statusFilter} appointments found.</p>}
        
        {!isNoFilteredAppointments && filteredAppointments?.map((appointment: Appointment) => {
          return (<AppointmentCard key={appointment._id} appointment={appointment} cancel={() => cancelAppointment(appointment._id)} isCancelling={isPending && appointmentToCancel === appointment._id}/>)
        })}
      </section>
      {appointmentToCancel && (
        <CancellationModal
          reason={cancellationReason}
          error={cancelError}
          isSubmitting={isPending}
          onReasonChange={setCancellationReason}
          onClose={() => {
            if (!isPending) {
              setAppointmentToCancel(null);
              setCancellationReason('');
              setCancelError('');
            }
          }}
          onConfirm={() => {
            const reason = cancellationReason.trim();
            if (!reason || isPending) return;
            setCancelError('');
            mutate({ appointmentId: appointmentToCancel, reason });
          }}
        />
      )}
    </div>
  )
}

export default PatientDashboard
