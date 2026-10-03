import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import DoctorPendingStatus from "../components/DoctorPendingStatus";
import DoctorRejectedStatus from "../components/DoctorRejectedStatus";

import WalletBalanceCard from "@/features/credit/components/WalletBalanceCard";
import DoctorAppointmentCard from "@/features/appointments/components/DoctorAppointmentCard";
import { useAppointments } from "@/features/appointments/hooks/useAppointments";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import { buttonListAppointmentStatus } from "@/features/appointments/constants";
import CancellationModal from "@/features/appointments/components/CancellationModal";

import queryClient from "@/shared/lib/queryClient";

import type { AppointmentStatus, DoctorAppointment } from "../types";

import { Link } from "react-router-dom";
import { formStyles as ui } from "@/shared/styles/formStyles";

import { doctorApi } from "../api/doctor.api";

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
    queryKey: ['doctors', 'me'],
    queryFn: () => doctorApi.getMyProfile(),
    staleTime: 30 * 60 * 1000  // 30 minutes
  });


  const {originalAppointmentList, isAppointmentsError, isAppointmentLoading} = useAppointments();
 


const { mutate: cancelMutate, isPending: isCancelPending } = useMutation({
  mutationFn: ({ appointmentId, reason }: CancelAppointmentVariables) => appointmentApi.cancel({ appointmentId, reason }),

  onSuccess: () => { 
    queryClient.invalidateQueries({ queryKey: ["appointments", "me"], });
    queryClient.invalidateQueries({queryKey: ["transactions", "me"], });

    setAppointmentToCancel(null);
    setCancellationReason("");
    setCancelError("");
  },

  onError: (error: Error) => {
    setCancelError( error.message ||  "Unable to cancel the appointment. Please try again.");
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
      <main className={ui.page}>
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Profile */}
          <section className={`${ui.card} flex flex-col gap-6 sm:flex-row sm:items-center`}>
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div
                className="grid h-20 w-20 place-items-center rounded-full border border-emerald-700/50 bg-emerald-900/30 text-3xl font-semibold text-emerald-300"
                aria-hidden="true"
              >
                {doctor.userId.name.charAt(0).toUpperCase()}
              </div>

              <button
                type="button"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
              >
                Upload photo
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  {doctor.userId.name}
                </h1>

                <span className="rounded-full border border-emerald-800 bg-emerald-950/50 px-3 py-1 text-xs font-semibold text-emerald-300">
                  {doctor.verificationStatus}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-ink">
                <span>{doctor.speciality}</span>
                <span>{doctor.totalExperience} years of experience</span>

                {doctor.rating !== undefined && (
                  <span>Rating: {doctor.rating}</span>
                )}
              </div>
            </div>

            <Link
              to="/doctor/profile"
              className={ui.secondaryButton}
            >
              View profile
            </Link>
          </section>

          {/* Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="min-w-0">
              <WalletBalanceCard detailsPath="wallet" />
            </section>

            <section className={ui.card}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                Next appointment
              </p>

              {/* TODO: Replace this placeholder with appointment API data */}
              <p className="mt-5 text-xl font-semibold text-ink">
                Today, 4:30 PM
              </p>
              <p className="mt-2 text-sm text-muted-ink">
                Patient name - Test test
              </p>
            </section>
          </div>

          {/* Availability */}
          <section className={`${ui.card} flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between`}>
            <div>
              <h2 className="text-xl font-semibold text-ink">
                Availability
              </h2>
              <p className="mt-2 text-sm text-muted-ink">
                Set the dates and times patients can book.
              </p>
            </div>

            <Link
              to="/doctor/availability"
              className={ui.primaryButton}
            >
              Manage availability
            </Link>
          </section>

          {/* Appointments */}
          <section className={ui.card}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink">
                  My appointments
                </h2>
                <p className="mt-1 text-sm text-muted-ink">
                  {filteredAppointments?.length ?? 0} appointments
                </p>
              </div>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Filter appointments">
              {buttonListAppointmentStatus.map((status) => (
                <li key={status}>
                  <button
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    aria-pressed={status === statusFilter}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      status === statusFilter
                        ? "bg-emerald-600 text-white"
                        : "border border-line bg-surface text-muted-ink hover:border-emerald-700 hover:text-ink"
                    }`}
                  >
                    {status}
                  </button>
                </li>
              ))}
            </ul>

            {isNoAppointments && (
              <p className="mt-8 rounded-lg border border-dashed border-line bg-surface p-6 text-sm text-muted-ink">
                You do not have any appointments yet.
              </p>
            )}

            {!isNoAppointments && isNoFilteredAppointments && (
              <p className="mt-8 rounded-lg border border-dashed border-line bg-surface p-6 text-sm text-muted-ink">
                No {statusFilter.toLowerCase()} appointments found.
              </p>
            )}

            {!isNoFilteredAppointments && (
              <div className="mt-6 grid gap-4">
                {filteredAppointments?.map(
                  (appointment: DoctorAppointment) => (
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
                  )
                )}
              </div>
            )}
          </section>

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
      </main>
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