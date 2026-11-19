import type { ReactNode } from "react";
import type { DoctorApplication } from "../api/doctorApproval.api";

export const reviewFocus = "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400";
export const reviewButton = `rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-surface disabled:opacity-60 ${reviewFocus}`;

const statusStyles = {
  PENDING: ["Pending", "bg-amber-950 text-amber-200"],
  VERIFIED: ["Verified", "bg-emerald-950 text-emerald-200"],
  REJECTED: ["Rejected", "bg-red-950 text-red-200"],
};

export function ApplicationStatus({ status }: { status: DoctorApplication["verificationStatus"] }) {
  const [label, color] = statusStyles[status];
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${color}`}>{label}</span>;
}

export function ReviewError({ children, retry }: { children: ReactNode; retry: () => void }) {
  return (
    <div className="space-y-3">
      <p role="alert" className="text-red-300">{children}</p>
      <button className={reviewButton} onClick={retry}>Try again</button>
    </div>
  );
}
