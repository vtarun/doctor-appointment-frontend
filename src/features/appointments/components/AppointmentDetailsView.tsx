import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/shared/api/apiError";
import { useAuthStore } from "@/shared/store/authStore";
import { queryKeys } from "@/shared/lib/queryKeys";
import { appointmentApi } from "../api/appointment.api";
import { invalidateAppointmentQueries } from "../api/invalidateAppointmentQueries";
import { joinOpensAt, useAppointmentClock } from "../appointmentTiming";
import type { AppointmentDetails } from "../types";
import AppointmentDetailsContent from "./AppointmentDetailsContent";
import CancellationModal from "./CancellationModal";
import JoinVideo from "./JoinVideo";
import { appointmentCopy } from "@/features/appointments/constants";



export default function AppointmentDetailsView({ appointmentId, role }: {
  appointmentId: string; role: "PATIENT" | "DOCTOR";
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const queryKey = queryKeys.appointmentDetail(userId, appointmentId);
  const details = useQuery({ queryKey, queryFn: () => appointmentApi.detail(appointmentId), enabled: !!appointmentId, retry: false });
  if (!appointmentId || (isAxiosError(details.error) && details.error.response?.status === 404)) {
    return <p role="status">{appointmentCopy.notFound}</p>;
  }
  if (details.isPending) return <p role="status">{appointmentCopy.loading}</p>;
  if (details.isError) return <div className="space-y-3">
    <p role="alert">{getApiErrorMessage(details.error, appointmentCopy.loadError)}</p>
    <button onClick={() => void details.refetch()}>{appointmentCopy.retry}</button>
  </div>;
  return <DetailsActions key={appointmentId} appointment={details.data} role={role} queryKey={queryKey} />;
}

function DetailsActions({ appointment, role, queryKey }: {
  appointment: AppointmentDetails; role: "PATIENT" | "DOCTOR"; queryKey: ReturnType<typeof queryKeys.appointmentDetail>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const client = useQueryClient();
  const now = useAppointmentClock(appointment.startTime, appointment.endTime);
  const doctor = role === "DOCTOR";

  async function updateDetail(changes: Partial<AppointmentDetails>) {
    await client.cancelQueries({ queryKey });
    client.setQueryData<AppointmentDetails>(queryKey, (previous) => previous && { ...previous, ...changes });
    await invalidateAppointmentQueries();
  }

  const notes = useMutation({
    mutationFn: (doctorNotes: string) => appointmentApi.saveNotes(appointment._id, doctorNotes),
    onSuccess: async ({ doctorNotes }) => {
      setDraft(null);
      setFeedback(appointmentCopy.notesSaved);
      await updateDetail({ doctorNotes });
    },
  });
  const cancel = useMutation({
    mutationFn: (reason: string) => appointmentApi.cancel({ appointmentId: appointment._id, reason }),
    onSuccess: async () => {
      setReason(null);
      setFeedback(appointmentCopy.cancelled);
      await updateDetail({ status: "CANCELLED" });
    },
  });
  const complete = useMutation({
    mutationFn: () => appointmentApi.complete(appointment._id),
    onSuccess: async () => {
      setFeedback(appointmentCopy.completed);
      await updateDetail({ status: "COMPLETED" });
    },
  });
  const busy = notes.isPending || cancel.isPending || complete.isPending;
  const booked = appointment.status === "BOOKED";
  const canCancel = booked && (!doctor || now < joinOpensAt(appointment));
  const canComplete = doctor && booked && now >= Date.parse(appointment.endTime);
  const canEdit = doctor && appointment.status !== "CANCELLED";

  function saveNotes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft !== null && canEdit && !busy) notes.mutate(draft);
  }

  return (
    <div className="space-y-5">
      <AppointmentDetailsContent appointment={appointment} role={role} />
      {feedback && <p role="status" className="text-emerald-300">{feedback}</p>}
      {complete.isError && <p role="alert">{getApiErrorMessage(complete.error, appointmentCopy.completeError)}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <JoinVideo appointment={appointment} />
        {canCancel && <button disabled={busy} onClick={() => { cancel.reset(); setReason(""); }}>{appointmentCopy.cancelAppointment}</button>}
        {canComplete && <button disabled={busy} onClick={() => complete.mutate()}>{complete.isPending ? appointmentCopy.completing : appointmentCopy.completeAppointment}</button>}
        {canEdit && draft === null && <button disabled={busy} onClick={() => {
          notes.reset();
          setFeedback("");
          setDraft(appointment.doctorNotes ?? "");
        }}>{appointment.doctorNotes ? appointmentCopy.editNotes : appointmentCopy.addNotes}</button>}
      </div>
      {canEdit && draft !== null && (
        <form className="space-y-3" onSubmit={saveNotes}>
          <label className="block">{appointmentCopy.doctorNotes}{" "}<textarea className="mt-1 block w-full rounded-md border border-line bg-surface p-3" rows={6}
              autoFocus value={draft} disabled={busy} onChange={(event) => setDraft(event.target.value)} />
          </label>
          {notes.isError && <p role="alert">{getApiErrorMessage(notes.error, appointmentCopy.notesSaveError)}</p>}
          <div className="flex gap-4">
            <button disabled={busy} type="submit">{notes.isPending ? appointmentCopy.saving : appointmentCopy.saveNotes}</button>
            <button disabled={busy} type="button" onClick={() => setDraft(null)}>{appointmentCopy.cancel}</button>
          </div>
        </form>
      )}
      {reason !== null && <CancellationModal reason={reason} onReasonChange={setReason} isSubmitting={cancel.isPending}
        error={cancel.isError ? getApiErrorMessage(cancel.error, appointmentCopy.cancelError) : ""}
        onClose={() => setReason(null)} onConfirm={() => { if (!busy && canCancel && reason.trim()) cancel.mutate(reason.trim()); }} />}
    </div>
  );
}
