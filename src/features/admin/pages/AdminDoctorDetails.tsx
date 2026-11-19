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
import { adminCopy } from "@/features/admin/constants";

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
    client.invalidateQueries({ queryKey: ["admin", "doctors", "verified"] }),
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
      <Link className={`text-emerald-300 underline ${reviewFocus}`} to={ROUTES.admin.doctors}>{adminCopy.backToRequests}</Link>
      <h1 ref={heading} tabIndex={-1} className="text-2xl font-semibold wrap-anywhere">{data?.name ?? adminCopy.applicationTitle}</h1>
      {approved && <p role="status" className="text-emerald-300">{adminCopy.doctorApproved}</p>}
      {notFound ? (
        <p role="status">{adminCopy.applicationNotFound}</p>
      ) : !loadApplication ? (
        <p role="status" className="text-muted-ink">{adminCopy.applicationUnavailable}</p>
      ) : application.isPending ? (
        <p role="status">{adminCopy.loadingApplication}</p>
      ) : application.isError && !data ? (
        <ReviewError retry={() => void application.refetch()}>
          {getAdminDoctorErrorMessage(application.error, adminCopy.applicationLoadError)}
        </ReviewError>
      ) : data && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <ApplicationStatus status={approved ? "VERIFIED" : data.verificationStatus} />
            {data.submittedAt && <p className="text-muted-ink">{adminCopy.submittedOn(formatApplicationDate(data.submittedAt))}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Details title={adminCopy.personalDetails} fields={[
              [adminCopy.name, data.name], [adminCopy.dateOfBirth, data.dateOfBirth && formatApplicationDate(data.dateOfBirth)], [adminCopy.gender, data.gender],
            ]} />
            <Details title={adminCopy.professionalDetails} fields={[
              [adminCopy.specialty, data.specialty], [adminCopy.qualification, data.qualification], [adminCopy.experienceYears, data.experienceYears], [adminCopy.bio, data.bio],
            ]} />
            <Details title={adminCopy.practiceDetails} fields={[
              [adminCopy.clinic, data.clinicName], [adminCopy.city, data.city], [adminCopy.consultationType, data.consultationType], [adminCopy.consultationFee, data.consultationFee],
            ]} />
            <section className="space-y-3 rounded-xl border border-line bg-panel p-5 wrap-anywhere">
              <h2 className="text-lg font-semibold">{adminCopy.credentials}</h2>
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
              ) : <p className="text-muted-ink">{adminCopy.noCredentials}</p>}
            </section>
          </div>
          {canApprove && (
            <button ref={approveButton} className={reviewButton} onClick={() => {
              approval.reset();
              dialog.current?.showModal();
            }}>{adminCopy.approveDoctor}</button>
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
          <h2 id="approve-doctor-title" className="text-lg font-semibold">{adminCopy.approveDoctorPrompt(data?.name)}</h2>
          <p id="approve-doctor-description">{adminCopy.approvalDescription}</p>
          {approval.isError && (
            <p role="alert" className="text-red-300">
              {alreadyProcessed ? adminCopy.alreadyProcessed :
                getAdminDoctorErrorMessage(approval.error, adminCopy.doctorApprovalError)}
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button autoFocus className={`px-3 py-2 ${reviewFocus}`} onClick={closeDialog} disabled={approval.isPending}>{adminCopy.cancel}</button>
            <button className={reviewButton} disabled={approval.isPending || !canApprove} onClick={() => approval.mutate()}>
              {approval.isPending ? adminCopy.approving : adminCopy.confirmApproval}
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
      ) : <p className="text-muted-ink">{adminCopy.noDetails}</p>}
    </section>
  );
}
