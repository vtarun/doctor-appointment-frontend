import type { AppointmentStatus, ConsultationType } from "@/features/doctor/types";

export interface AppointmentSummary {
  id: string;
  participantName?: string;
  specialty?: string;
  startTime: string;
  endTime: string;
  consultationType: ConsultationType;
  status: AppointmentStatus;
}

export function selectNextAppointment(appointments: AppointmentSummary[], now: number) {
  return appointments
    .filter(({ status, startTime, endTime }) => {
      const start = Date.parse(startTime);
      const end = Date.parse(endTime);
      return status === "BOOKED" && Number.isFinite(start) && Number.isFinite(end)
        && start < end && end > now;
    })
    .sort((a, b) => Date.parse(a.startTime) - Date.parse(b.startTime) || a.id.localeCompare(b.id))[0];
}

const day = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatAppointmentTime(appointment: AppointmentSummary, now: number) {
  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  const today = new Date(now);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const describeDay = (date: Date) => {
    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, tomorrow)) return "Tomorrow";
    return day.format(date);
  };

  const endDay = isSameDay(start, end) ? "" : describeDay(end) + ", ";
  return describeDay(start) + ", " + time.format(start) + " – " + endDay + time.format(end);
}

