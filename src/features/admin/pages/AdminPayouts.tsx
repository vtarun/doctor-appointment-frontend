import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { getApiErrorMessage } from "@/shared/api/apiError";
import Modal from "@/shared/components/Modal";
import { adminManagement, type AdminPayout } from "../api/adminManagement.api";
import { reviewButton, ReviewError, reviewFocus } from "../components/ApplicationReview";
import { formatApplicationDate } from "../formatApplicationDate";
import { adminCopy } from "@/features/admin/constants";

const payoutKey = ["admin", "payouts"];
const amount = (value: number | undefined, currency: string) =>
  value == null ? adminCopy.unavailable : `${value.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currency}`;

export default function AdminPayouts() {
  const [selection, setSelection] = useState<{ id: string; confirm: boolean } | null>(null);
  const [feedback, setFeedback] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const client = useQueryClient();
  const requests = useQuery({ queryKey: payoutKey, queryFn: adminManagement.payouts });
  const selected = requests.data?.find(({ id }) => id === selection?.id);
  const approval = useMutation({
    mutationFn: adminManagement.approvePayout,
    onSuccess: async (processed, id) => {
      await client.cancelQueries({ queryKey: payoutKey });
      client.setQueryData<AdminPayout[]>(payoutKey, (previous) =>
        previous?.map((request) => request.id === id ? processed : request));
      setSelection(null);
      setFeedback(adminCopy.payoutProcessed(id));
      await client.invalidateQueries({ queryKey: payoutKey });
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) void requests.refetch();
    },
  });
  const conflict = isAxiosError(approval.error) && approval.error.response?.status === 409;
  const eligible = selected?.status === "PROCESSING" && selected.canApprove && !conflict;
  const pending = requests.data?.filter(({ status }) => status === "PROCESSING");
  const history = requests.data?.filter(({ status }) => status !== "PROCESSING");

  function open(id: string, confirm: boolean) {
    approval.reset();
    setSelection({ id, confirm });
  }

  function renderList(items: AdminPayout[]) {
    return <ul className="space-y-3">{items.map((item) => (
      <li key={item.id} className="space-y-2 rounded-xl border border-line bg-panel p-4 wrap-anywhere">
        <h3 className="text-lg font-semibold">{item.doctor.name}</h3>
        <p>{item.doctor.specialty || adminCopy.specialtyUnavailable}</p>
        <p>{adminCopy.payoutAmountSummary(item.creditsRequested, amount(item.netAmount, item.currency))}</p>
        <p>{item.destination || adminCopy.destinationUnavailable} · {formatApplicationDate(item.createdAt)}</p>
        <p>{item.status === "PROCESSING" ? adminCopy.pendingReview : item.status === "PROCESSED" ? adminCopy.processed : adminCopy.rejected}</p>
        {item.status === "PROCESSING" && !item.canApprove && <p>{item.ineligibilityReason || adminCopy.ineligiblePayout}</p>}
        <div className="flex flex-wrap items-center gap-4">
          <button className={reviewFocus} onClick={() => open(item.id, false)}>{adminCopy.viewDetails}</button>
          {item.status === "PROCESSING" && item.canApprove && (
            <button className={reviewButton} onClick={() => open(item.id, true)}>{adminCopy.reviewPayout}</button>
          )}
        </div>
      </li>
    ))}</ul>;
  }

  return (
    <section className="space-y-4">
      <h2 ref={heading} tabIndex={-1} className="text-2xl font-semibold">{adminCopy.payouts}</h2>
      {feedback && <p role="status" className="text-emerald-300">{feedback}</p>}
      {requests.isPending && <p role="status">{adminCopy.loadingPayouts}</p>}
      {requests.isError && <ReviewError retry={() => void requests.refetch()}>
        {getApiErrorMessage(requests.error, adminCopy.payoutLoadError)}
      </ReviewError>}
      {pending?.length === 0 && <p>{adminCopy.noPendingPayouts}</p>}
      {!!pending?.length && renderList(pending)}
      {!!history?.length && <section className="space-y-2"><h3 className="font-semibold">{adminCopy.payoutHistory}</h3>{renderList(history)}</section>}
      {selection && (
        <Modal title={selection.confirm ? adminCopy.confirmPayoutApproval : adminCopy.payoutDetails}
          onClose={() => setSelection(null)} busy={approval.isPending} fallbackFocus={heading}>
          {selected ? (
            <dl className="space-y-2 wrap-anywhere">
              {[
                [adminCopy.request, selected.id], [adminCopy.doctor, selected.doctor.name], [adminCopy.email, selected.doctor.email],
                [adminCopy.specialty, selected.doctor.specialty], [adminCopy.requestedCredits, selected.creditsRequested],
                [adminCopy.grossAmount, amount(selected.grossAmount, selected.currency)], [adminCopy.fee, amount(selected.feeAmount, selected.currency)],
                [adminCopy.netAmount, amount(selected.netAmount, selected.currency)], [adminCopy.destination, selected.destination],
                [adminCopy.requested, formatApplicationDate(selected.createdAt)], [adminCopy.status, selected.status],
              ].map(([label, value]) => <div key={label}><dt className="text-sm text-muted-ink">{label}</dt><dd>{value ?? adminCopy.unavailable}</dd></div>)}
            </dl>
          ) : <p>{adminCopy.payoutUnavailable}</p>}
          {selected && !eligible && <p role="status" className="mt-3">
            {selected.ineligibilityReason || adminCopy.payoutNoLongerEligible}
          </p>}
          {approval.isError && <p role="alert" className="mt-3 text-red-300">
            {conflict ? adminCopy.payoutNoLongerEligible : getApiErrorMessage(approval.error, adminCopy.payoutApprovalError)}
          </p>}
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            <button className={reviewFocus} disabled={approval.isPending} onClick={() => setSelection(null)}>
              {selection.confirm ? adminCopy.cancel : adminCopy.close}
            </button>
            {eligible && selected && (selection.confirm ?
              <button className={reviewButton} disabled={approval.isPending} onClick={() => approval.mutate(selected.id)}>
                {approval.isPending ? adminCopy.approving : adminCopy.confirmApproval}
              </button> :
              <button className={reviewButton} onClick={() => open(selected.id, true)}>{adminCopy.continueToApproval}</button>)}
          </div>
        </Modal>
      )}
    </section>
  );
}
