import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import { adminManagement } from "../api/adminManagement.api";
import { reviewFocus } from "../components/ApplicationReview";
import PendingDoctors from "./PendingDoctors";
import VerifiedDoctors from "./VerifiedDoctors";
import AdminPayouts from "./AdminPayouts";
import { adminCopy } from "@/features/admin/constants";

const sections = [
  { path: ROUTES.admin.doctors, label: adminCopy.pendingVerification },
  { path: ROUTES.admin.verified, label: adminCopy.doctors },
  { path: ROUTES.admin.payouts, label: adminCopy.payouts },
];

export default function AdminDashboard() {
  const { pathname } = useLocation();
  const path = pathname.toLowerCase().replace(/\/$/, "");
  const active = sections.find((section) => section.path === path)?.path ?? ROUTES.admin.doctors;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold">{adminCopy.dashboardTitle}</h1>
      <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)]">
        <nav aria-label={adminCopy.sectionsLabel} className="flex flex-wrap gap-2 self-start rounded-xl border border-line bg-panel p-2 md:flex-col">
          {sections.map(({ path, label }) => (
            <Link key={path} to={path} aria-current={active === path ? "page" : undefined}
              className={`${reviewFocus} px-3 py-2 text-sm ${active === path ? "bg-emerald-950 font-semibold text-emerald-200" : "text-muted-ink hover:text-ink"}`}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">
          {active === ROUTES.admin.doctors && <PendingDoctors loadApplications={adminManagement.pending} />}
          {active === ROUTES.admin.verified && <VerifiedDoctors />}
          {active === ROUTES.admin.payouts && <AdminPayouts />}
        </div>
      </div>
    </div>
  );
}
