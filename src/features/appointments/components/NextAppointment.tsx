import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formStyles as ui } from "@/shared/styles/formStyles";
import { ROUTES } from "@/router/routes";
import { specialties } from "@/features/patient/constants/specialities";
import type { Appointment } from "@/shared/types";
import type { DoctorAppointment } from "@/features/doctor/types";
import { formatAppointmentTime, selectNextAppointment, type AppointmentSummary } from "../appointmentSummary";

interface Props {
  appointments: (Appointment | DoctorAppointment)[] | undefined;
  isLoading: boolean;
  isError: boolean;
  retry: () => void;
  role: "patient" | "doctor";
}

function summarize(appointment: Appointment | DoctorAppointment, role: Props["role"]): AppointmentSummary {
  const { _id, startTime, endTime, consultationType, status } = appointment;
  const doctor = role === "patient" && "doctorId" in appointment ? appointment.doctorId : undefined;
  const patient = role === "doctor" && typeof appointment.patientId === "object" ? appointment.patientId : undefined;
  return {
    id: _id, startTime, endTime, consultationType, status,
    participantName: doctor?.userId?.name ?? patient?.userId?.name,
    specialty: doctor?.speciality,
  };
}

export default function NextAppointment({ appointments, isLoading, isError, retry, role }: Props) {
  const [now, setNow] = useState(Date.now);
  const appointment = selectNextAppointment(appointments?.map((item) => summarize(item, role)) ?? [], now);
  const start = appointment ? Date.parse(appointment.startTime) : Infinity;
  const end = appointment ? Date.parse(appointment.endTime) : Infinity;
  const isInProgress = start <= now;
  const nextBoundary = isInProgress ? end : start;

  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setTimeout(refresh, Math.max(0, Math.min(30_000, nextBoundary - Date.now())));
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [now, nextBoundary]);

  const specialty = specialties.find(({ slug }) => slug === appointment?.specialty)?.name ?? appointment?.specialty;

  return (
    <section className={ui.card + " min-w-0 space-y-4"} aria-label="Next appointment">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-emerald-400">Next appointment</h2>
      {isLoading ? <p role="status">Loading next appointment…</p> : isError ? (
        <div className="space-y-2">
          <p role="alert">Unable to load the next appointment. Please try again.</p>
          <button type="button" className={ui.secondaryButton} onClick={retry}>Retry</button>
        </div>
      ) : appointment ? (
        <>
          <div className="space-y-1 wrap-anywhere">
            <p role="status" className="text-emerald-300">{isInProgress && "In progress"}</p>
            <p className="text-lg font-semibold">{appointment.participantName?.trim() || (role === "patient" ? "Doctor" : "Patient")}</p>
            {specialty && <p>{specialty}</p>}
            <p>{formatAppointmentTime(appointment, now)}</p>
            <p>{appointment.consultationType === "VIDEO" ? "Video" : "In person"}</p>
          </div>
          <a className={ui.secondaryButton} href="#dashboard-appointments">View appointments</a>
        </>
      ) : (
        <>
          <p role="status">No upcoming appointments</p>
          <Link className={ui.secondaryButton} to={role === "patient" ? ROUTES.patient.doctors : "/doctor/availability"}>
            {role === "patient" ? "Find a doctor" : "Manage availability"}
          </Link>
        </>
      )}
    </section>
  );
}

