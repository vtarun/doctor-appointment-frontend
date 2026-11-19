import { useQuery } from "@tanstack/react-query";
import { generatePath, Link } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { queryKeys } from "@/shared/lib/queryKeys";
import { getAdminDoctorErrorMessage, type DoctorApplicationSummary } from "../api/doctorApproval.api";
import { ApplicationStatus, reviewFocus, ReviewError } from "../components/ApplicationReview";
import { formatApplicationDate } from "../formatApplicationDate";
import { yearsOfExperience } from "@/shared/constants";
import { adminCopy } from "@/features/admin/constants";

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
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{adminCopy.pendingVerification}</h2>
      {!loadApplications ? (
        <p role="status" className="text-muted-ink">{adminCopy.pendingUnavailable}</p>
      ) : applications.isPending ? (
        <p role="status">{adminCopy.loadingPending}</p>
      ) : applications.isError ? (
        <ReviewError retry={() => void applications.refetch()}>
          {getAdminDoctorErrorMessage(applications.error, adminCopy.pendingLoadError)}
        </ReviewError>
      ) : applications.data.length === 0 ? (
        <p role="status" className="text-muted-ink">{adminCopy.noPending}</p>
      ) : (
        <ul className="space-y-3">
          {applications.data.map((application) => (
            <li key={application.doctorId} className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-5 wrap-anywhere sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <ApplicationStatus status="PENDING" />
                <h3 className="text-lg font-semibold">{application.name}</h3>
                {application.specialty && <p>{application.specialty}</p>}
                {application.experienceYears != null && <p>{yearsOfExperience(application.experienceYears)}</p>}
                {application.submittedAt && <p className="text-muted-ink">{adminCopy.submittedOn(formatApplicationDate(application.submittedAt))}</p>}
              </div>
              <Link className={`shrink-0 text-emerald-300 underline ${reviewFocus}`} to={generatePath(ROUTES.admin.doctorDetails, { doctorId: application.doctorId })}
                aria-label={adminCopy.reviewApplicationFor(application.name)}>{adminCopy.reviewApplication}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
