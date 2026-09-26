import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";
import DoctorAppointmentCard from "@/features/appointments/components/DoctorAppointmentCard";
import DoctorPendingStatus from "../components/DoctorPendingStatus";
import DoctorRejectedStatus from "../components/DoctorRejectedStatus";

// import { doctorApi } from "@/features/doctor/api/doctor.api";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import queryClient from "@/shared/lib/queryClient";
import { buttonListAppointmentStatus } from "@/features/appointments/constants";

import type { AppointmentStatus, DoctorAppointment } from "../types";
import { mockDoctorPersonalDetails } from "../mock-data";

import './DoctorDashboard.css';
import CancellationModal from "@/features/appointments/components/CancellationModal";

type StatusFilter = AppointmentStatus | 'ALL';

const intervalTimer = 30000;

  interface CancelAppointmentVariables {
    appointmentId: string;
    reason: string;
  }

const DoctorDashboard = () => {
  const [now, setNow] = useState(() => Date.now());

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [cancelError, setCancelError] = useState<string>('');
  const [completeError, setCompleteError] = useState<string>('');
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  const {data: doctor, isLoading: isLoadingDoctor, isError: isDoctorError } = useQuery({
    queryKey: ['doctor', 'me'],
    queryFn: () => mockDoctorPersonalDetails,//doctorApi.getMyProfile(),
    staleTime: 30 * 60 * 1000  // 30 minutes
  });


  const {originalAppointmentList, isAppointmentsError, isAppointmentLoading} = useAppointments();
 


const {
  mutate: cancelMutate,
  isPending: isCancelPending,
} = useMutation({
  mutationFn: ({
    appointmentId,
    reason,
  }: CancelAppointmentVariables) =>
    appointmentApi.cancel({
      appointmentId,
      reason,
    }),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["appointments", "me"],
    });

    queryClient.invalidateQueries({
      queryKey: ["transactions", "me"],
    });

    setAppointmentToCancel(null);
    setCancellationReason("");
    setCancelError("");
  },

  onError: (error: Error) => {
    setCancelError(
      error.message ||
        "Unable to cancel the appointment. Please try again.",
    );
  },
});

  const {mutate: completeMutate, isPending: isCompletePending} = useMutation({
    mutationFn: (appointmentId: string) => appointmentApi.complete(appointmentId),
    onSuccess: () => {
      setCancelError('');
      queryClient.invalidateQueries({queryKey: ['appointments', 'me']});
      queryClient.invalidateQueries({queryKey: ['transactions', 'me']});
    },
    onError: (error) => {
      setCompleteError(error.message)
    }
  });

  const completeAppointment = (appointmentId: string) => {
    setCompleteError('');
    completeMutate(appointmentId);
  }

  const openCancellationModal = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setCancellationReason("");
    setCancelError("");
  };

  const closeCancellationModal = () => {
    if (isCancelPending) {
      return;
    }

    setAppointmentToCancel(null);
    setCancellationReason("");
    setCancelError("");
  };

  const confirmCancellation = () => {
    const reason = cancellationReason.trim();

    if (
      !appointmentToCancel ||
      !reason ||
      isCancelPending
    ) {
      return;
    }

    setCancelError("");

    cancelMutate({
      appointmentId: appointmentToCancel,
      reason,
    });
  };


  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, intervalTimer);

    return () => window.clearInterval(intervalId);
  }, []);

  const isNoAppointments = originalAppointmentList?.length === 0;
  
  const filteredAppointments = statusFilter === 'ALL' ? originalAppointmentList : originalAppointmentList?.filter((appointment: DoctorAppointment) => appointment.verificationStatus === statusFilter);

  const isNoFilteredAppointments = filteredAppointments?.length === 0;

  if(isLoadingDoctor){
    return <p>Loading doctor details</p>
  }

  if(isDoctorError || !doctor){
    return <p role='alert'>Unable to load doctor details. Please try again.</p>
  }

  if (doctor.verificationStatus === "PENDING") {
    return <DoctorPendingStatus />
  }

  if (doctor.verificationStatus === "REJECTED") {
    return <DoctorRejectedStatus reason= "" />//{doctor?.rejectionReason}/>
  }

  if (isAppointmentLoading) {
    return <p>Loading appointments...</p>;
  }

  if (isAppointmentsError) {
    return (
      <p role="alert">
        Unable to load appointments. Please try again.
      </p>
    );
  }


  return (  
    <div className="doctor-dashboard">      
      <section className='hero-section doctor-section'>
        <div>
          <img src="" alt={`${doctor.userId.name}'s profile`} />
          <button type='button'>Upload photo</button>
        </div>
        <div>
          <h2>{doctor.userId.name}</h2>
          <span>{doctor.verificationStatus}</span>
        </div>
        <div>
          <p>{doctor.speciality}</p>
          <p>{doctor.totalExperience}</p>
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

          {/* Add filter to show speciefic appointments */}
          <div>
            <h3 style={{display: 'block', marginLeft: '25px'}}>My Appointments <span>{filteredAppointments?.length ?? 0} appointments</span></h3>
            <ul style={{display: 'flex', listStyle: 'none', gap: '20px' }}>
              {buttonListAppointmentStatus.map((status) => <li key={status} ><button onClick={() => setStatusFilter(status)} className={status === statusFilter ? 'active' : ''}>{status}</button></li>)}      
            </ul>
          </div>

          

          {isNoAppointments && <p>You do not have any appointments yet.</p>}

          {(!isNoAppointments && isNoFilteredAppointments) && <p>No {statusFilter} appointments found.</p>}
          
          {!isNoFilteredAppointments && filteredAppointments?.map((appointment: DoctorAppointment) => (
            <DoctorAppointmentCard
              key={appointment._id}
              appointment={appointment}
              now={now}
              cancelError={cancelError}
              completeError={completeError}
              cancel={() =>
                openCancellationModal(appointment._id)
              }
              complete={() =>
                completeAppointment(appointment._id)
              }
              isCancelling={
                isCancelPending &&
                appointmentToCancel === appointment._id
              }
              isCompleting={isCompletePending}
            />
          ),)}
        </section>
      </div>  

      {appointmentToCancel && (
        <CancellationModal
          reason={cancellationReason}
          error={cancelError}
          isSubmitting={isCancelPending}
          onReasonChange={setCancellationReason}
          onConfirm={confirmCancellation}
          onClose={closeCancellationModal}
        />
      )}
    </div>
  )
}

export default DoctorDashboard




// doctor flow 
/*  -Dashboard
      Sections:
      - Profile summary with edit button(route to profile page)
        useQuery - doctor ,me
      - Show wallet summary
        useQuery, wallet
      - Current day appointments list
        useAppointment
        - Show button to complete or cancel appointment
        useMutation, appointments, cancel, complete
        - Show modal while canceling appointment.
          useMutation, cancel appointment
      - Show calender to select for any particular date appointments
          useMutation, appointments for paticular date
      - Show different status of appointms button to filter appointments
      - Show availability button to route doctor to schedule availability
        useQuery, availability for present day, date auto selected in calender
        select time/date to create new availability, upon success show for that date all avilable slots
        Cancel availability(reject if appointment already booked by patient with error message)
    -Wallet
      - Show date wise all transations
    -Appointments
      - Show date wise all appointments, past present and future
      - Add feature of repeat appointments remarks and list for particular patient
      
      


*/