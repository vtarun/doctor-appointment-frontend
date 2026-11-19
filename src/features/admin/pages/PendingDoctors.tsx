import { useQuery } from "@tanstack/react-query";
import { generatePath, Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { queryKeys } from "@/shared/lib/queryKeys";
import { getAdminDoctorErrorMessage, type DoctorApplicationSummary } from "../api/doctorApproval.api";
import { ApplicationStatus, reviewFocus, ReviewError } from "../components/ApplicationReview";
import { formatApplicationDate } from "../formatApplicationDate";

interface Props {
  loadApplications?: () => Promise<DoctorApplicationSummary[]>;
}

export default function PendingDoctors({ loadApplications }: Props) {
  const applications = useQuery({
    queryKey: queryKeys.adminPendingDoctors,
    queryFn: loadApplications,
    enabled: Boolean(loadApplications),
    retry: false,
  });

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold">Doctor Requests</h1>
      {!loadApplications ? (
        <p role="status" className="text-muted-ink">Pending doctor applications are currently unavailable.</p>
      ) : applications.isPending ? (
        <p role="status">Loading pending applications…</p>
      ) : applications.isError ? (
        <ReviewError retry={() => void applications.refetch()}>
          {getAdminDoctorErrorMessage(applications.error, "Could not load pending applications.")}
        </ReviewError>
      ) : applications.data.length === 0 ? (
        <p role="status" className="text-muted-ink">No pending doctor applications.</p>
      ) : (
        <ul className="space-y-3">
          {applications.data.map((application) => (
            <li key={application.doctorId} className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-5 wrap-anywhere sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <ApplicationStatus status="PENDING" />
                <h2 className="text-lg font-semibold">{application.name}</h2>
                {application.specialty && <p>{application.specialty}</p>}
                {application.experienceYears != null && <p>{application.experienceYears} years of experience</p>}
                {application.submittedAt && <p className="text-muted-ink">Submitted {formatApplicationDate(application.submittedAt)}</p>}
              </div>
              <Link className={`shrink-0 text-emerald-300 underline ${reviewFocus}`} to={generatePath(ROUTES.admin.doctorDetails, { doctorId: application.doctorId })}>
                Review application<span className="sr-only"> for {application.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
