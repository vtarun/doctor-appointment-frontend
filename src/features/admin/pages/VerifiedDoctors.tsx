import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminManagement } from "../api/adminManagement.api";
import { getAdminDoctorErrorMessage } from "../api/doctorApproval.api";
import { ApplicationStatus, ReviewError, reviewFocus } from "../components/ApplicationReview";
import { yearsOfExperience } from "@/shared/constants";
import { adminCopy } from "@/features/admin/constants";

export default function VerifiedDoctors() {
  const [search, setSearch] = useState("");
  const doctors = useQuery({ queryKey: ["admin", "doctors", "verified"], queryFn: adminManagement.verified });
  const term = search.trim().toLowerCase();
  const results = doctors.data?.filter((doctor) =>
    [doctor.name, doctor.specialty, doctor.email].some((value) => value?.toLowerCase().includes(term)),
  );

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">{adminCopy.doctors}</h2>
      <label className="block max-w-md">{adminCopy.searchDoctors}{" "}<input type="search" className={`mt-1 block w-full border border-line bg-panel p-2 ${reviewFocus}`}
          placeholder={adminCopy.searchPlaceholder} value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>
      {doctors.isPending && <p role="status">{adminCopy.loadingDoctors}</p>}
      {doctors.isError && <ReviewError retry={() => void doctors.refetch()}>
        {getAdminDoctorErrorMessage(doctors.error, adminCopy.doctorLoadError)}
      </ReviewError>}
      {doctors.data?.length === 0 && <p role="status">{adminCopy.noVerifiedDoctors}</p>}
      {!!doctors.data?.length && results?.length === 0 && <p role="status">{adminCopy.noSearchMatches}</p>}
      <ul className="grid gap-3 lg:grid-cols-2">
        {results?.map((doctor) => (
          <li key={doctor.doctorId} className="space-y-2 rounded-xl border border-line bg-panel p-4 wrap-anywhere">
            <ApplicationStatus status={doctor.verificationStatus} />
            <h3 className="text-lg font-semibold">{doctor.name}</h3>
            <p>{doctor.specialty || adminCopy.specialtyUnavailable}</p>
            <p>{doctor.experienceYears == null ? adminCopy.experienceUnavailable : yearsOfExperience(doctor.experienceYears)}</p>
            <p>{doctor.email}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
