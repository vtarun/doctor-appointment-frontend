import { useState } from "react";
import type { Appointment } from "@/shared/types";
import Modal from "@/shared/components/Modal";
import { formatAppointmentDateTime, formatAppointmentTime } from "../appointmentTiming";
import AppointmentDetailsView from "./AppointmentDetailsView";
import JoinVideo from "./JoinVideo";
import { appointmentCopy } from "@/features/appointments/constants";

interface AppointmentCardProps {
  appointment: Appointment;
  cancel: () => void;
  isCancelling: boolean;
}

export default function AppointmentCard({ appointment, cancel, isCancelling }: AppointmentCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <article className="space-y-3 rounded-xl border border-line bg-panel p-4 wrap-anywhere">
      <header className="flex flex-wrap justify-between gap-2">
        <h3 className="font-semibold">{appointment.doctorId.userId.name}</h3>
        <span>{appointment.status}</span>
      </header>
      <p>{appointment.doctorId.speciality}</p>
      <p><time dateTime={appointment.startTime}>{formatAppointmentDateTime(appointment.startTime)}</time>
        {" – "}<time dateTime={appointment.endTime}>{formatAppointmentTime(appointment.endTime)}</time></p>
      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => setShowDetails(true)}>{appointmentCopy.viewDetails}</button>
        <JoinVideo appointment={appointment} />
        {appointment.status === "BOOKED" && <button type="button" disabled={isCancelling} onClick={cancel}>
          {isCancelling ? appointmentCopy.cancelling : appointmentCopy.cancel}
        </button>}
      </div>
      {showDetails && <Modal title={appointmentCopy.title} onClose={() => setShowDetails(false)}>
        <AppointmentDetailsView appointmentId={appointment._id} role="PATIENT" />
        <button className="mt-5" onClick={() => setShowDetails(false)}>{appointmentCopy.close}</button>
      </Modal>}
    </article>
  );
}
