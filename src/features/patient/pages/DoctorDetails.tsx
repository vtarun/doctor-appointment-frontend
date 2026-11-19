import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { doctorsApi } from "../api/doctors.api";
import { availabilityApi } from "@/features/availability/api/availability.api";
import type { Slot } from "@/features/availability/types";
import { invalidateAppointmentQueries } from "@/features/appointments/api/invalidateAppointmentQueries";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import { formatAppointmentDateTime, formatAppointmentTime } from "@/features/appointments/appointmentTiming";
import type { BookAppointmentRequest } from "@/features/appointments/types";
import Avatar from "@/shared/components/Avatar";
import { getApiErrorMessage } from "@/shared/api/apiError";
import { queryKeys } from "@/shared/lib/queryKeys";
import { formatConsultationType } from "@/shared/utils";
import { ROUTES } from "@/router/routes";
import AvailabilitySlots from "../components/AvailabilitySlots";
import { sameSlot } from "@/features/availability/types/slotIdentity";
import { yearsOfExperience } from "@/shared/constants";
import { bookingCopy } from "@/features/patient/constants/booking";

const primary = "rounded-md bg-emerald-400 px-4 py-2 font-semibold text-surface disabled:opacity-50";
type Consultation = BookAppointmentRequest["consultationType"];

export default function DoctorDetails() {
  const { doctorId = "" } = useParams();
  return <Booking key={doctorId} doctorId={doctorId} />;
}

function Booking({ doctorId }: { doctorId: string }) {
  const [range] = useState(() => {
    const from = new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 7);
    return { from: from.toISOString(), to: to.toISOString() };
  });
  const [selected, setSelected] = useState<Slot | null>(null);
  const [blocked, setBlocked] = useState<Slot[]>([]);
  const [step, setStep] = useState<"time" | "details" | "success">("time");
  const [preferredType, setPreferredType] = useState<Consultation>();
  const [concern, setConcern] = useState("");
  const doctorQuery = useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => doctorsApi.getDoctorById(doctorId),
    staleTime: 30 * 60_000,
  });
  const availability = useQuery({
    queryKey: [...queryKeys.slots, doctorId, range.from, range.to],
    queryFn: () => availabilityApi.getSlots(doctorId, range.from, range.to),
  });
  const booking = useMutation({
    mutationFn: appointmentApi.book,
    onSuccess: () => {
      setStep("success");
      void invalidateAppointmentQueries();
    },
    onError: (error, request) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        setBlocked((previous) => [...previous, { startTime: request.startTime, endTime: request.endTime, status: "UNAVAILABLE" }]);
        void availability.refetch();
      }
    },
  });
  const doctor = doctorQuery.data;
  const types: Consultation[] = doctor?.consultationType === "BOTH" ? ["IN_PERSON", "VIDEO"] :
    doctor?.consultationType === "ONLINE" || doctor?.consultationType === "VIDEO" ? ["VIDEO"] :
    doctor?.consultationType === "IN_PERSON" || (doctor && !doctor.consultationType) ? ["IN_PERSON"] : [];
  const type = preferredType && types.includes(preferredType) ? preferredType : types[0];
  const slots = (availability.data?.slots ?? []).filter((slot) =>
    slot.status === "AVAILABLE" && !blocked.some((item) => sameSlot(item, slot)),
  ).sort((left, right) => Date.parse(left.startTime) - Date.parse(right.startTime));
  const unavailable = !!selected && !slots.some((slot) => sameSlot(selected, slot));
  const quote = type ? doctor?.bookingCosts?.[type] : undefined;

  function changeSlot() {
    if (unavailable) setSelected(null);
    booking.reset();
    setStep("time");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8">
      {doctorQuery.isPending && <p role="status">{bookingCopy.loadingDoctor}</p>}
      {doctorQuery.isError && <div role="alert">
        <p>{getApiErrorMessage(doctorQuery.error, bookingCopy.doctorLoadError)}</p>
        <button onClick={() => void doctorQuery.refetch()}>{bookingCopy.retry}</button>
      </div>}
      {doctor && <header className="space-y-3 rounded-xl border border-line bg-panel p-5 wrap-anywhere">
        <div className="flex items-center gap-4">
          <Avatar name={doctor.userId.name} src={doctor.userId.avatarUrl ?? doctor.profileImageUrl} className="size-14 shrink-0" />
          <div>
            <h1 className="text-2xl font-semibold">{doctor.userId.name}</h1>
            <p>{doctor.speciality || bookingCopy.specialtyUnavailable}</p>
            {doctor.experienceYears != null && <p>{yearsOfExperience(doctor.experienceYears)}</p>}
          </div>
        </div>
        {(doctor.clinicName || doctor.city) && <p>{[doctor.clinicName, doctor.city].filter(Boolean).join(" · ")}</p>}
        <p className="whitespace-pre-wrap">{doctor.bio || bookingCopy.noBio}</p>
        <p>{types.length ? types.map(formatConsultationType).join(" · ") : bookingCopy.typesUnavailable}</p>
        {availability.data && <p className="text-sm text-muted-ink">{bookingCopy.availableSlots(slots.length)}</p>}
      </header>}
      {step === "success" ? (
        <section className="space-y-3 rounded-xl border border-line bg-panel p-5">
          <h2 className="text-xl font-semibold" role="status">{bookingCopy.booked}</h2>
          <Link className="text-emerald-300 underline" to={`${ROUTES.patient.root}#dashboard-appointments`}>{bookingCopy.viewAppointments}</Link>
        </section>
      ) : doctor && <section className="space-y-4 rounded-xl border border-line bg-panel p-5">
        {step === "time" && <>
          <h2 className="text-xl font-semibold">{bookingCopy.availableAppointments}</h2>
          {availability.isPending && <p role="status">{bookingCopy.loadingTimes}</p>}
          {availability.isError && <div role="alert">
            <p>{getApiErrorMessage(availability.error, bookingCopy.timesLoadError)}</p>
            <button onClick={() => void availability.refetch()}>{bookingCopy.retry}</button>
          </div>}
          {availability.data && <AvailabilitySlots from={range.from} to={range.to} slots={slots} selectedSlot={selected}
            onSelect={setSelected} onContinue={() => setStep("details")} />}
        </>}
        {step === "details" && selected && (
          <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!type || booking.isPending || unavailable) return;
            booking.mutate({
              doctorId, startTime: selected.startTime, endTime: selected.endTime, consultationType: type,
              issueNote: concern.trim() || undefined,
            });
          }}>
            <h2 className="text-xl font-semibold">{bookingCopy.consultationDetails}</h2>
            <p>{doctor.userId.name}</p>
            <p>{formatAppointmentDateTime(selected.startTime)} – {formatAppointmentTime(selected.endTime)}</p>
            <fieldset disabled={booking.isPending} className="space-y-2">
              <legend className="font-medium">{bookingCopy.consultationType}</legend>
              {types.map((option) => (
                <label key={option} className="mr-5 inline-flex items-center gap-2">
                  <input type="radio" name="consultation-type" checked={type === option} onChange={() => setPreferredType(option)} />
                  {formatConsultationType(option)}
                </label>
              ))}
              {!types.length && <p>{bookingCopy.typesUnavailableMessage}</p>}
            </fieldset>
            <label className="block">{bookingCopy.medicalConcern}{" "}<textarea className="mt-1 block w-full rounded-md border border-line bg-surface p-3" rows={4} value={concern}
                maxLength={1000} disabled={booking.isPending} aria-describedby="concern-info"
                onChange={(event) => setConcern(event.target.value)} />
            </label>
            <p id="concern-info" className="text-sm text-muted-ink">{bookingCopy.concernInfo}</p>
            <p className="font-medium">{bookingCopy.bookingCost(quote)}</p>
            {unavailable ? <p role="alert">{bookingCopy.slotUnavailable}</p> :
              booking.isError && <p role="alert">{getApiErrorMessage(booking.error, bookingCopy.bookingError)}</p>}
            <div className="flex flex-wrap items-center gap-4">
              <button type="button" className="underline" disabled={booking.isPending} onClick={changeSlot}>{bookingCopy.changeSlot}</button>
              <button type="submit" className={primary} disabled={booking.isPending || unavailable || !type}>
                {booking.isPending ? bookingCopy.booking : bookingCopy.confirmBooking}
              </button>
            </div>
          </form>
        )}
      </section>}
    </div>
  );
}
