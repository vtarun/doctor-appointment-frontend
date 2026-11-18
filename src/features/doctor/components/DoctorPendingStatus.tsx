import { formStyles as ui } from "@/shared/styles/formStyles";

const DoctorPendingStatus = () => {
  return (
    <main className={`${ui.page} grid place-items-center`}>
      <section
        className={`${ui.card} w-full max-w-lg text-center`}
        role="status"
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
          Verification pending
        </h1>

        <p className="mt-3 leading-7 text-muted-ink">
          Your documents are being reviewed. Please check again later.
        </p>
      </section>
    </main>
  );
};

export default DoctorPendingStatus;