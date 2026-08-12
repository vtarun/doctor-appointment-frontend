import { useMutation, useQuery } from "@tanstack/react-query";

import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";
import { doctorApi } from "@/features/doctor/api/doctor.api";
import { useState } from "react";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import queryClient from "@/shared/lib/queryClient";
import type { AppointmentStatus } from "../types";

type StatusFilter = AppointmentStatus | 'ALL';

const DoctorDashboard = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [cancelError, setCancelError] = useState<string>('');
  const [completeError, setCompleteError] = useState<string>('');
  const {data: doctor, isLoading: isLoadingDoctor, isError: isDoctorError } = useQuery({
    queryKey: ['doctor/me'],
    queryFn: () => doctorApi.getMyProfile(),
    staleTime: 30 * 60 * 1000  // 30 minutes
  });


  const {originalAppointmentList, isAppointmentsError, isAppointmentLoading} = useAppointments();

  const {mutate, isPending} = useMutation({
    mutationFn: (appointmentId: string) => appointmentApi.cancel(appointmentId),
    onSuccess: () => {
      setCancelError('');
      queryClient.invalidateQueries({queryKey: ['appointments/me']});
      queryClient.invalidateQueries({queryKey: ['transactions']});
    },
    onError: (error) => {
      setCancelError(error.message)
    }
  });

  const cancelAppointment = (appointmentId: string) => {
    setCancelError('');
    mutate(appointmentId);
  };

  const isNoAppointments = originalAppointmentList?.length === 0;
  
  const filteredAppointments = statusFilter === 'ALL' ? originalAppointmentList : originalAppointmentList?.filter((appointment: Appointment) => appointment.status === statusFilter);

  const isNoFilteredAppointments = filteredAppointments?.length === 0;

  if(isAppointmentLoading) return <p>Loading appointments...</p>

  if(isAppointmentsError) return <p>Error loading appointments list</p>

  if(isLoadingDoctor){
    return <p>Loading doctor details</p>
  }

  if(isDoctorError || !doctor){
    return <p role='alert'>Unable to load doctor details. Please try again.</p>
  }

  if (doctor.status === "PENDING") {
    return (
      <section className="card">
        <h1>Verification pending</h1>
        <p>
          Your documents are still being verified. Please check again later.
        </p>
      </section>
    );
  }

  if (doctor.status === "REJECTED") {
    return (
      <section className="card">
        <h1>Verification rejected</h1>
        <p>
          Your doctor profile could not be verified.
        </p>

        {doctor.rejectionReason && (
          <p>
            <strong>Reason:</strong> {doctor.rejectionReason}
          </p>
        )}
      </section>
    );
  }


  return (  
    <div className="doctor-dashboard">      
      <section className='hero-section doctor-section'>
        <div>
          <img src="" alt={`${doctor.name}'s profile`} />
          <button type='button'>Upload photo</button>
        </div>
        <div>
          <h2>{doctor.name}</h2>
          <span>{doctor.status}</span>
        </div>
        <div>
          <p>{doctor.speciality}</p>
          <p>{doctor.totalExperince}</p>
          {doctor.rating !== undefined && (
            <p>Rating: {doctor?.rating}</p>
          )}
        </div>
      </section>

      <div className='dashboard-summary'>
        <section className='wallet-section'>
          <WalletBalanceCard detailsPath="wallet" />          
        </section>

        <section className='next-appointment card'>
          {/* TODO: Replace with appointment API data */}
          <p>Next appointment</p>
          <p><b>Today, 4:30 PM</b></p>
          <p>Patient name - Test test</p>
          <button type='button'></button>
        </section>
      </div>  

      <div className="container">
          <section className="availability-section">
            <h2>Availability</h2>
          </section>

          <section className="appointments-section">
            <h2>Appointments</h2>
          </section>
      </div>  
    </div>
  )
}

export default DoctorDashboard
