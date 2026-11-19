import { useState } from "react";
import type { Slot } from "@/features/availability/types";
import { sameSlot } from "@/features/availability/types/slotIdentity";
import { appointmentTimeZone, formatAppointmentTime } from "@/features/appointments/appointmentTiming";
import { bookingCopy } from "@/features/patient/constants/booking";

const dayLabel = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
const dayKey = (day: Date) => [day.getFullYear(), day.getMonth(), day.getDate()].join("-");



export default function AvailabilitySlots({ from, to, slots, selectedSlot, onSelect, onContinue }: {
  from: string; to: string; slots: Slot[]; selectedSlot: Slot | null;
  onSelect: (slot: Slot | null) => void; onContinue: () => void;
}) {
  const dates: Date[] = [];
  const day = new Date(from);
  day.setHours(0, 0, 0, 0);
  const end = Date.parse(to);
  while (day.getTime() < end) {
    dates.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }
  const initial = selectedSlot ? new Date(selectedSlot.startTime) : new Date(slots[0]?.startTime ?? from);
  const [date, setDate] = useState(() => dayKey(initial));
  const activeDate = dates.some((day) => dayKey(day) === date) ? date : dayKey(dates[0]);
  const available = slots.filter((slot) => dayKey(new Date(slot.startTime)) === activeDate);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-ink">{bookingCopy.localTimezone(appointmentTimeZone)}</p>
      <fieldset className="flex flex-wrap gap-2">
        <legend className="mb-2 font-medium">{bookingCopy.chooseDate}</legend>
        {dates.map((day) => {
          const key = dayKey(day);
          return (
            <label key={key} className="cursor-pointer">
              <input type="radio" name="appointment-date" className="peer sr-only" checked={activeDate === key}
                onChange={() => { setDate(key); onSelect(null); }} />
              <span className="block rounded-md border border-line px-3 py-2 peer-checked:border-emerald-400 peer-checked:bg-emerald-950 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-400">
                {dayLabel.format(day)}
              </span>
            </label>
          );
        })}
      </fieldset>
      {available.length === 0 ? <p role="status">
        {slots.length ? bookingCopy.noTimesOnDate : bookingCopy.noAvailability}
      </p> : (
        <fieldset className="flex flex-wrap gap-2">
          <legend className="mb-2 font-medium">{bookingCopy.chooseTime}</legend>
          {available.map((slot) => (
            <label key={slot.startTime} className="cursor-pointer">
              <input type="radio" name="appointment-slot" className="peer sr-only" checked={sameSlot(selectedSlot, slot)}
                onChange={() => onSelect(slot)} />
              <span className="block rounded-md border border-line px-3 py-2 peer-checked:border-emerald-400 peer-checked:bg-emerald-950 peer-focus-visible:outline-2 peer-focus-visible:outline-emerald-400">
                {formatAppointmentTime(slot.startTime)} – {formatAppointmentTime(slot.endTime)}
              </span>
            </label>
          ))}
        </fieldset>
      )}
      <button type="button" disabled={!available.some((slot) => sameSlot(selectedSlot, slot))} onClick={onContinue}
        className="rounded-md bg-emerald-400 px-4 py-2 font-semibold text-surface disabled:opacity-50">{bookingCopy.continue}</button>
    </div>
  );
}
