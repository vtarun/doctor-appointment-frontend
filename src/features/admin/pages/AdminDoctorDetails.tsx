import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { queryKeys } from "@/shared/lib/queryKeys";
import {
  approveDoctor, getAdminDoctorErrorMessage,
  type DoctorApplication, type DoctorApplicationSummary, type DoctorCredential,
} from "../api/doctorApproval.api";
import { ApplicationStatus, reviewButton, reviewFocus, ReviewError } from "../components/ApplicationReview";
import CredentialDocument from "../components/CredentialDocument";
import { formatApplicationDate } from "../formatApplicationDate";

interface Props {
  loadApplication?: (doctorId: string) => Promise<DoctorApplication | null>;
  loadCredential?: (doctorId: string, credentialId: string) => Promise<Blob>;
}

export default function AdminDoctorDetails(props: Props) {
  const { doctorId = "" } = useParams();
  return <ApplicationReview key={doctorId} doctorId={doctorId} {...props} />;
}

function ApplicationReview({ doctorId, loadApplication, loadCredential }: Props & { doctorId: string }) {
  const client = useQueryClient();
  const detailKey = queryKeys.adminDoctorApplication(doctorId);
  const dialog = useRef<HTMLDialogElement>(null);
  const approveButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [approved, setApproved] = useState(false);

  const application = useQuery({
    queryKey: detailKey,
    queryFn: loadApplication ? () => loadApplication(doctorId) : undefined,
    enabled: Boolean(loadApplication && doctorId),
    retry: false,
  });
  const refreshApplications = () => Promise.all([
    client.invalidateQueries({ queryKey: detailKey }),
    client.invalidateQueries({ queryKey: queryKeys.adminPendingDoctors }),
  ]);
  const approval = useMutation({
    mutationFn: () => approveDoctor(doctorId),
    onSuccess: async () => {
      await Promise.all([
        client.cancelQueries({ queryKey: detailKey }),
        client.cancelQueries({ queryKey: queryKeys.adminPendingDoctors }),
      ]);
      client.setQueryData<DoctorApplication | null>(detailKey, (previous) =>
        previous ? { ...previous, verificationStatus: "VERIFIED" } : previous,
      );
      client.setQueryData<DoctorApplicationSummary[]>(queryKeys.adminPendingDoctors, (previous) =>
        previous?.filter((item) => item.doctorId !== doctorId),
      );
      setApproved(true);
      dialog.current?.close();
      heading.current?.focus();
      await refreshApplications();
    },
    onError: (error) => {
      if (isAxiosError(error) && [404, 409].includes(error.response?.status ?? 0)) {
        void refreshApplications();
      }
    },
  });

  const data = application.data;
  const notFound = !doctorId || data === null ||
    (isAxiosError(application.error) && application.error.response?.status === 404);
  const alreadyProcessed = isAxiosError(approval.error) && approval.error.response?.status === 409;
  const canApprove = data?.verificationStatus === "PENDING" && !approved && !alreadyProcessed && !notFound;
  const closeDialog = () => {
    dialog.current?.close();
    (approveButton.current ?? heading.current)?.focus();
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
      <Link className={`text-emerald-300 underline ${reviewFocus}`} to={ROUTES.admin.doctors}>Back to requests</Link>
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold wrap-anywhere">{data?.name ?? "Doctor application"}</h1>
      {approved && <p role="status" className="text-emerald-300">Doctor approved successfully</p>}
      {notFound ? (
        <p role="status">Doctor application not found.</p>
      ) : !loadApplication ? (
        <p role="status" className="text-muted-ink">Doctor application details are currently unavailable.</p>
      ) : application.isPending ? (
        <p role="status">Loading application…</p>
      ) : application.isError && !data ? (
        <ReviewError retry={() => void application.refetch()}>
          {getAdminDoctorErrorMessage(application.error, "Could not load this application.")}
        </ReviewError>
      ) : data && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <ApplicationStatus status={approved ? "VERIFIED" : data.verificationStatus} />
            {data.submittedAt && <p className="text-muted-ink">Submitted {formatApplicationDate(data.submittedAt)}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Details title="Personal details" fields={[
              ["Name", data.name], ["Date of birth", data.dateOfBirth && formatApplicationDate(data.dateOfBirth)], ["Gender", data.gender],
            ]} />
            <Details title="Professional details" fields={[
              ["Specialty", data.specialty], ["Qualification", data.qualification], ["Years of experience", data.experienceYears], ["Bio", data.bio],
            ]} />
            <Details title="Practice details" fields={[
              ["Clinic", data.clinicName], ["City", data.city], ["Consultation type", data.consultationType], ["Consultation fee", data.consultationFee],
            ]} />
            <section className="space-y-3 rounded-xl border border-line bg-panel p-5 wrap-anywhere">
              <h2 className="text-lg font-semibold">Credentials</h2>
              {data.credentials?.length ? (
                <ul className="space-y-3">
                  {data.credentials.map((credential: DoctorCredential) => (
                    <CredentialDocument
                      key={credential.id}
                      credential={credential}
                      load={loadCredential ? () => loadCredential(doctorId, credential.id) : undefined}
                    />
                  ))}
                </ul>
              ) : <p className="text-muted-ink">No credential documents available.</p>}
            </section>
          </div>
          {canApprove && (
            <button ref={approveButton} className={reviewButton} onClick={() => {
              approval.reset();
              dialog.current?.showModal();
            }}>Approve doctor</button>
          )}
        </>
      )}
      <dialog
        ref={dialog}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-panel p-6 text-ink backdrop:bg-black/70"
        aria-labelledby="approve-doctor-title"
        aria-describedby="approve-doctor-description"
        onCancel={(event) => {
          event.preventDefault();
          if (!approval.isPending) closeDialog();
        }}
      >
        <div className="space-y-4 wrap-anywhere">
          <h2 id="approve-doctor-title" className="text-lg font-semibold">Approve {data?.name ?? "doctor"}?</h2>
          <p id="approve-doctor-description">Approval enables verified-doctor access.</p>
          {approval.isError && (
            <p role="alert" className="text-red-300">
              {alreadyProcessed ? "This application has already been processed." :
                getAdminDoctorErrorMessage(approval.error, "Could not approve this doctor. Please try again.")}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button autoFocus className={`px-3 py-2 ${reviewFocus}`} onClick={closeDialog} disabled={approval.isPending}>Cancel</button>
            <button className={reviewButton} disabled={approval.isPending || !canApprove} onClick={() => approval.mutate()}>
              {approval.isPending ? "Approving…" : "Confirm approval"}
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}

function Details({ title, fields }: { title: string; fields: [string, string | number | undefined][] }) {
  const available = fields.filter(([, value]) => value != null && value !== "");
  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-5 wrap-anywhere">
      <h2 className="text-lg font-semibold">{title}</h2>
      {available.length ? (
        <dl className="space-y-2">
          {available.map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-muted-ink">{label}</dt>
              <dd className="whitespace-pre-wrap">{value}</dd>
            </div>
          ))}
        </dl>
      ) : <p className="text-muted-ink">No details provided.</p>}
    </section>
  );
}
