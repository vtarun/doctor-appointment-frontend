import { useEffect, useState } from "react";
import type { Appointment } from "@/shared/types";

type Timing = Pick<Appointment, "status" | "consultationType" | "startTime" | "endTime">;
export const joinOpensAt = (appointment: Timing) => Date.parse(appointment.startTime) - 30 * 60_000;

export function canJoinVideo(appointment: Timing, now: number) {
  return appointment.status === "BOOKED" && appointment.consultationType === "VIDEO" &&
    now >= joinOpensAt(appointment) && now < Date.parse(appointment.endTime);
}

export function useAppointmentClock(startTime?: string, endTime?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const update = () => setNow(Date.now());
    const current = Date.now();
    const boundaries = [Date.parse(startTime ?? "") - 30 * 60_000, Date.parse(endTime ?? "")]
      .filter((time) => time > current && time - current < 2_147_483_647);
    const timers = boundaries.map((time) => window.setTimeout(update, time - current));
    document.addEventListener("visibilitychange", update);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("visibilitychange", update);
    };
  }, [startTime, endTime]);
  return now;
}

const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" });
const timeWithZone = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit", timeZoneName: "short" });

export const formatAppointmentDateTime = (value: string | number) => dateTime.format(new Date(value));
export const formatAppointmentTime = (value: string) => timeWithZone.format(new Date(value));
export const appointmentTimeZone = dateTime.resolvedOptions().timeZone;
