import { formStyles as ui } from "@/shared/styles/formStyles";

interface DoctorRejectedStatusProps {
  reason: string;
}

const DoctorRejectedStatus = ({
  reason
}: DoctorRejectedStatusProps) => {
  return (
    <main className={`${ui.page} grid place-items-center`}>
      <section
        className={`${ui.card} w-full max-w-lg text-center`}
        role="status"
      >
        <div
          className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-red-800/50 bg-red-900/20 text-3xl text-red-300"
          aria-hidden="true"
        >
          ×
        </div>

        <span className="mt-5 inline-block rounded-full border border-red-800/50 bg-red-900/20 px-3 py-1 text-xs font-semibold text-red-300">
          VERIFICATION REJECTED
        </span>

        <h1 className="mt-5 text-2xl font-bold text-ink">
          Verification rejected
        </h1>

        <p className="mt-3 leading-7 text-muted-ink">
          Your doctor profile could not be verified.
        </p>

        {reason && (
          <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/20 p-4 text-left">
            <p className="text-sm leading-6 text-red-200">
              <strong>Reason:</strong> {reason}
            </p>
          </div>
        )}
      </section>
    </main>
  );
};

export default DoctorRejectedStatus;