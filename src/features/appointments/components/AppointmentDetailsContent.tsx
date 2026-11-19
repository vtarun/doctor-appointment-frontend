import Avatar from "@/shared/components/Avatar";
import { formatConsultationType } from "@/shared/utils";
import { appointmentTimeZone, formatAppointmentDateTime } from "../appointmentTiming";
import type { AppointmentDetails } from "../types";
import { appointmentCopy } from "@/features/appointments/constants";

export default function AppointmentDetailsContent({ appointment, role }: {
  appointment: AppointmentDetails; role: "PATIENT" | "DOCTOR";
}) {
  const participant = role === "DOCTOR" ? appointment.patient : appointment.doctor;
  return (
    <div className="space-y-5 wrap-anywhere">
      <div className="flex items-center gap-3">
        <Avatar name={participant.name} src={participant.avatarUrl} className="size-12 shrink-0" />
        <div>
          <p className="font-semibold">{participant.name}</p>
          {participant.subtitle && <p className="text-muted-ink">{participant.subtitle}</p>}
        </div>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div><dt className="text-muted-ink">{appointmentCopy.starts}</dt><dd>{formatAppointmentDateTime(appointment.startTime)}</dd></div>
        <div><dt className="text-muted-ink">{appointmentCopy.ends}</dt><dd>{formatAppointmentDateTime(appointment.endTime)}</dd></div>
        <div><dt className="text-muted-ink">{appointmentCopy.timezone}</dt><dd>{appointmentTimeZone}</dd></div>
        <div><dt className="text-muted-ink">{appointmentCopy.consultationType}</dt><dd>{formatConsultationType(appointment.consultationType)}</dd></div>
        <div><dt className="text-muted-ink">{appointmentCopy.status}</dt><dd>{appointment.status}</dd></div>
      </dl>
      <section>
        <h3 className="font-semibold">{appointmentCopy.reason}</h3>
        <p className="whitespace-pre-wrap">{appointment.issueNote || appointmentCopy.noReason}</p>
      </section>
      <section>
        <h3 className="font-semibold">{appointmentCopy.doctorNotes}</h3>
        <p className="whitespace-pre-wrap">{appointment.doctorNotes || appointmentCopy.noNotes}</p>
      </section>
    </div>
  );
}
