import { Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import type { Appointment } from "@/shared/types";
import { canJoinVideo, formatAppointmentDateTime, joinOpensAt, useAppointmentClock } from "../appointmentTiming";
import { appointmentCopy } from "@/features/appointments/constants";

type VideoAppointment = Pick<Appointment, "_id" | "status" | "consultationType" | "startTime" | "endTime">;

export default function JoinVideo({ appointment }: { appointment: VideoAppointment }) {
  const now = useAppointmentClock(appointment.startTime, appointment.endTime);
  if (appointment.status !== "BOOKED" || appointment.consultationType !== "VIDEO") return null;
  if (canJoinVideo(appointment, now)) {
    return <Link className="text-emerald-300 underline" to={`${ROUTES.videoCall}?appointmentId=${encodeURIComponent(appointment._id)}`}>{appointmentCopy.joinVideo}</Link>;
  }
  return <span className="text-sm text-muted-ink">
    {now < joinOpensAt(appointment) ? appointmentCopy.videoOpens(formatAppointmentDateTime(joinOpensAt(appointment))) : appointmentCopy.videoWindowEnded}
  </span>;
}
