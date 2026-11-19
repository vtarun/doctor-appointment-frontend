import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { appointmentApi } from "@/features/appointments/api/appointment.api";
import { queryKeys } from "@/shared/lib/queryKeys";
import {
  canJoinVideo, formatAppointmentDateTime, joinOpensAt, useAppointmentClock,
} from "@/features/appointments/appointmentTiming";
import type { AppointmentDetails, AppointmentParticipant } from "@/features/appointments/types";
import { ROUTES } from "@/router/routes";
import { getApiErrorMessage } from "@/shared/api/apiError";
import { useAuthStore } from "@/shared/store/authStore";
import Avatar from "@/shared/components/Avatar";
import Modal from "@/shared/components/Modal";
import { simulatedCall, type CallEvent, type CallPhase, type MediaSettings } from "../callSimulation";
import { videoCopy } from "@/features/video/constants";

export default function VideoConsultation() {
  const [params] = useSearchParams();
  const id = params.get("appointmentId")?.trim() || "";
  const user = useAuthStore((state) => state.user);
  const doctor = user?.role === "DOCTOR";
  const dashboard = doctor ? ROUTES.doctor.root : ROUTES.patient.root;
  const details = useQuery({
    queryKey: queryKeys.appointmentDetail(user?.id, id),
    queryFn: () => appointmentApi.detail(id),
    enabled: Boolean(id && user),
    retry: false,
  });
  const local = doctor ? details.data?.doctor : details.data?.patient;
  const wrongParticipant = (local && local.userId !== user?.id) ||
    (isAxiosError(details.error) && details.error.response?.status === 403);
  const missing = isAxiosError(details.error) && details.error.response?.status === 404;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-8">
      <Link className="text-emerald-300 underline" to={dashboard}>{videoCopy.backToDashboard}</Link>
      <h1 className="text-3xl font-semibold">{videoCopy.title}</h1>
      {import.meta.env.DEV && <p className="text-sm font-semibold text-amber-200">{videoCopy.simulationLabel}</p>}
      {!id ? <p role="status">{videoCopy.missingId}</p>
        : wrongParticipant ? <p role="alert">{videoCopy.wrongParticipant}</p>
        : missing ? <p role="status">{videoCopy.notFound}</p>
        : details.isPending ? <p role="status">{videoCopy.loading}</p>
        : details.isError ? <div className="space-y-3">
          <p role="alert">{getApiErrorMessage(details.error, videoCopy.loadError)}</p>
          <button onClick={() => void details.refetch()}>{videoCopy.retryLoad}</button>
        </div>
        : <Consultation key={id} appointment={details.data} doctor={doctor} />}
    </div>
  );
}

function Consultation({ appointment, doctor }: { appointment: AppointmentDetails; doctor: boolean }) {
  const now = useAppointmentClock(appointment.startTime, appointment.endTime);
  const [phase, setPhase] = useState<CallPhase>("pre-join");
  const [media, setMedia] = useState<MediaSettings>({ microphone: false, camera: false });
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [connectedAt, setConnectedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const local = doctor ? appointment.doctor : appointment.patient;
  const remote = doctor ? appointment.patient : appointment.doctor;
  const eligible = canJoinVideo(appointment, now);
  const active = phase === "waiting" || phase === "connected" || phase === "reconnecting";
  const ended = now >= Date.parse(appointment.endTime);
  const showRoom = active && appointment.status === "BOOKED" && appointment.consultationType === "VIDEO";

  function dispatch(event: CallEvent) {
    const next = simulatedCall.transition(phase, event);
    setPhase(next);
    if (event === "arrive" && next === "connected") {
      setConnectedAt(Date.now());
      setElapsed(0);
    }
    if (event === "depart" || event === "leave" || event === "fail") {
      setConnectedAt(null);
      setElapsed(0);
    }
  }

  useEffect(() => {
    const event = simulatedCall.next(phase);
    if (!event || !eligible) return;
    const timer = window.setTimeout(() => setPhase((current) => simulatedCall.transition(current, event)), 850);
    return () => window.clearTimeout(timer);
  }, [phase, eligible]);

  useEffect(() => {
    if (connectedAt === null || phase !== "connected" || !showRoom || ended) return;
    const tick = () => setElapsed(Math.floor((Date.now() - connectedAt) / 1000));
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [connectedAt, phase, showRoom, ended]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = String(elapsed % 60).padStart(2, "0");
  const notice = appointment.status === "CANCELLED" ? videoCopy.cancelled
    : appointment.status === "COMPLETED" ? videoCopy.completed
    : appointment.consultationType === "IN_PERSON" ? videoCopy.inPerson
    : ended ? videoCopy.scheduledEnd
    : !eligible ? videoCopy.joiningOpens(formatAppointmentDateTime(joinOpensAt(appointment))) : null;

  const phaseMessage: Record<CallPhase, string> = {
    "pre-join": videoCopy.preJoin,
    connecting: videoCopy.connecting,
    waiting: videoCopy.waiting(remote.name),
    connected: videoCopy.joined(remote.name),
    reconnecting: videoCopy.reconnecting,
    failed: videoCopy.failed,
    ended: videoCopy.left,
  };
  const canJoin = eligible && import.meta.env.DEV && (phase === "pre-join" || phase === "failed" || phase === "ended");
  const showPreview = eligible && import.meta.env.DEV && (phase === "pre-join" || phase === "connecting" || phase === "failed");

  return (
    <section className="space-y-5 rounded-xl border border-line bg-panel p-5 wrap-anywhere">
      <header>
        <h2 className="text-xl font-semibold">{remote.name}</h2>
        <p>{formatAppointmentDateTime(appointment.startTime)} – {formatAppointmentDateTime(appointment.endTime)}</p>
      </header>
      {notice && <p role="status">{notice}</p>}
      {eligible && !import.meta.env.DEV && <p role="status">{videoCopy.unavailable}</p>}
      {import.meta.env.DEV && (eligible || showRoom || phase === "ended") && <p role="status">{phaseMessage[phase]}</p>}
      {showRoom && phase === "connected" && <p aria-label={videoCopy.durationLabel}>{videoCopy.connectedDuration(minutes, seconds)}</p>}
      {(showPreview || showRoom) && <div className={showRoom ? "grid gap-4 md:grid-cols-[2fr_1fr]" : "max-w-md"}>
        {showRoom && <ParticipantTile participant={remote} absent={phase === "waiting"} />}
        <ParticipantTile participant={local} local media={media} />
      </div>}
      {(showPreview || showRoom) && <p className="text-sm text-muted-ink">{videoCopy.mediaHelp}</p>}
      <div className="flex flex-wrap gap-3">
        {(showPreview || showRoom) && (["microphone", "camera"] as const).map((device) => (
          <button key={device} type="button" aria-pressed={media[device]} disabled={phase === "connecting" || ended}
            onClick={() => setMedia((current) => simulatedCall.toggleMedia(current, device))}
            className="rounded-md border border-line px-3 py-2 focus-visible:outline-2 focus-visible:outline-emerald-400">
            {videoCopy.mediaToggle(videoCopy[device], media[device])}
          </button>
        ))}
        {canJoin && <button className="rounded-md bg-emerald-400 px-4 py-2 font-semibold text-surface" onClick={() => dispatch("join")}>
          {phase === "failed" ? videoCopy.retry : phase === "ended" ? videoCopy.rejoin : videoCopy.join}
        </button>}
        {showRoom && <button className="rounded-md border border-line px-3 py-2" onClick={() => {
          if (phase === "waiting") dispatch("leave");
          else setConfirmLeave(true);
        }}>{videoCopy.leaveConsultation}</button>}
      </div>
      {import.meta.env.DEV && eligible && (active || phase === "connecting") && (
        <details className="space-y-2 border-t border-line pt-3">
          <summary className="cursor-pointer">{videoCopy.simulationControls}</summary>
          <div className="flex flex-wrap gap-4">
            {phase === "waiting" && <button onClick={() => dispatch("arrive")}>{videoCopy.simulateArrival}</button>}
            {phase === "connected" && <button onClick={() => dispatch("depart")}>{videoCopy.simulateDeparture}</button>}
            {phase === "connected" && <button onClick={() => dispatch("interrupt")}>{videoCopy.simulateInterruption}</button>}
            <button onClick={() => dispatch("fail")}>{videoCopy.simulateFailure}</button>
          </div>
        </details>
      )}
      {confirmLeave && <Modal title={videoCopy.confirmLeave} onClose={() => setConfirmLeave(false)}>
        <div className="flex justify-end gap-4">
          <button autoFocus onClick={() => setConfirmLeave(false)}>{videoCopy.stay}</button>
          <button onClick={() => { setConfirmLeave(false); dispatch("leave"); }}>{videoCopy.leave}</button>
        </div>
      </Modal>}
    </section>
  );
}

function ParticipantTile({ participant, local = false, absent = false, media }: {
  participant: AppointmentParticipant; local?: boolean; absent?: boolean; media?: MediaSettings;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-line bg-surface p-4 text-center">
      {!absent && <Avatar name={participant.name} src={participant.avatarUrl} className="size-16" />}
      <h3 className="font-semibold">{videoCopy.participantName(participant.name, local)}</h3>
      {absent ? <p className="text-muted-ink">{videoCopy.waitingToJoin}</p> : <p className="text-sm text-muted-ink">{videoCopy.mediaStatus(media?.microphone, media?.camera)}
      </p>}
    </div>
  );
}
