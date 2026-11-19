import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Avatar from "@/shared/components/Avatar";
import { formStyles as ui } from "@/shared/styles/formStyles";
import { useAuthStore } from "@/shared/store/authStore";
import { specialties } from "@/features/patient/constants/specialities";
import { ROUTES } from "@/router/routes";

import { doctorApi } from "../api/doctor.api";

const consultationLabels = { ONLINE: "Online", IN_PERSON: "In person", BOTH: "Both" } as const;
const feeFormat = new Intl.NumberFormat(undefined, { style: "currency", currency: "INR", currencyDisplay: "code" });
const verificationLabels = { VERIFIED: "Verified", PENDING: "Pending", REJECTED: "Rejected" };

interface DoctorProfileResponse {
  verificationStatus: keyof typeof verificationLabels;
  speciality?: string;
  qualification?: string;
  experienceYears?: number;
  bio?: string;
  clinicName?: string;
  city?: string;
  consultationType?: keyof typeof consultationLabels;
  consultationFee?: number;
  credentials?: string[];
}

function DetailSection({ title, fields }: { title: string; fields: [string, ReactNode][] }) {
  return (
    <section className={ui.card + " min-w-0"}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div key={label} className={"min-w-0 " + (label === "Professional bio" ? "sm:col-span-2" : "")}>
            <dt className="text-sm text-muted-ink">{label}</dt>
            <dd className="whitespace-pre-wrap wrap-anywhere">{value ?? "Not provided"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function DoctorProfile() {
  const user = useAuthStore((state) => state.user);
  const profileQuery = useQuery<DoctorProfileResponse | null>({
    queryKey: ["doctors", "me", user?.id],
    queryFn: doctorApi.getMyProfile,
  });
  const profile = profileQuery.data;
  const name = user?.name ?? "Doctor";
  const specialty = specialties.find(({ slug }) => slug === profile?.speciality)?.name ?? profile?.speciality;
  return (
    <div className={ui.page}>
      <div className="mx-auto max-w-5xl space-y-6">
        <Link to={ROUTES.doctor.root} className={ui.secondaryButton}>Back to dashboard</Link>
        <header>
          <h1 className={ui.title}>Doctor profile</h1>
        </header>
        {profileQuery.isPending || (profileQuery.isError && profileQuery.isFetching) ? (
          <p role="status">Loading doctor profile…</p>
        ) : profileQuery.isError ? (
          <div className={ui.card + " space-y-3"}>
            <p role="alert">Unable to load your doctor profile.</p>
            <button type="button" className={ui.secondaryButton} onClick={() => void profileQuery.refetch()}>Retry</button>
          </div>
        ) : !profile ? (
          <p role="status" className={ui.card}>Doctor profile not found.</p>
        ) : (
          <>
            <section aria-label="Profile summary" className={ui.card + " flex flex-col gap-4 sm:flex-row sm:items-center"}>
              <Avatar name={name} src={user?.avatarUrl} className="size-16 text-xl" />
              <div className="min-w-0 flex-1 space-y-2 wrap-anywhere">
                <h2 className="text-2xl font-semibold">{name}</h2>
                <p className="text-muted-ink">{specialty || "Specialty not provided"}</p>
                <p className="flex flex-wrap items-center gap-2 text-sm">
                  Verification status
                  <span className="rounded-full border border-line bg-surface px-3 py-1 font-semibold text-ink">
                    {verificationLabels[profile.verificationStatus]}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={ROUTES.account} className={ui.secondaryButton}>Manage account</Link>
              </div>
            </section>
            <div className="grid gap-6">
              <DetailSection title="Professional details" fields={[
                ["Specialty", specialty],
                ["Qualification", profile.qualification],
                ["Experience", profile.experienceYears == null ? undefined : profile.experienceYears + (profile.experienceYears === 1 ? " year" : " years")],
                ["Professional bio", profile.bio],
              ]} />
              <div className="grid gap-6 md:grid-cols-2">
                <DetailSection title="Practice details" fields={[["Clinic name", profile.clinicName], ["City", profile.city]]} />
                <DetailSection title="Consultation settings" fields={[
                  ["Consultation type", profile.consultationType && consultationLabels[profile.consultationType]],
                  ["Consultation fee", profile.consultationFee == null ? "Not set" : feeFormat.format(profile.consultationFee)],
                ]} />
              </div>
            </div>
            <section className={ui.card}>
              <h2 className="text-xl font-semibold">Credentials</h2>
              {profile.credentials?.length ? (
                <p className={ui.subtitle}>
                  {profile.credentials.length} {profile.credentials.length === 1 ? "document" : "documents"} submitted.
                </p>
              ) : <p className={ui.subtitle}>No credentials submitted.</p>}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
