import { formStyles as ui } from "@/shared/styles/formStyles";

interface DoctorPendingStatusProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  refreshFailed: boolean;
}

const DoctorPendingStatus = ({ onRefresh, isRefreshing, refreshFailed }: DoctorPendingStatusProps) => {
  return (
    <main className={`${ui.page} grid place-items-center`}>
      <section
        className={`${ui.card} w-full max-w-lg text-center`}
      >
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber-800/50 bg-amber-900/20 text-2xl text-amber-300"
          aria-hidden="true"
        >
          ◷
        </div>

        <span className="mt-5 inline-block rounded-full border border-amber-800/50 bg-amber-900/20 px-3 py-1 text-xs font-semibold text-amber-300">
          PENDING REVIEW
        </span>

        <h1 className="mt-5 text-2xl font-bold text-ink">
          Application submitted
        </h1>

        <p className="mt-3 leading-7 text-muted-ink">
          Your doctor profile is awaiting admin review. If approved, you can access your doctor dashboard.
          If rejected, your verification status will show the decision.
        </p>
        <button type="button" className={`${ui.primaryButton} mt-6`} onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? "Checking status…" : "Refresh verification status"}
        </button>
        {refreshFailed && (
          <p className={ui.error} role="alert">Unable to refresh your verification status. Please try again.</p>
        )}
      </section>
    </main>
  );
};

export default DoctorPendingStatus;
