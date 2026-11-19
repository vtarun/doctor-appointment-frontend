import Modal from "@/shared/components/Modal";
import { appointmentCopy, cancellationReasonMaxLength } from "@/features/appointments/constants";

interface CancellationModalProps {
  reason: string;
  error: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function CancellationModal({
  reason, error, isSubmitting, onReasonChange, onConfirm, onClose,
}: CancellationModalProps) {
  return (
    <Modal title={appointmentCopy.cancelAppointment} onClose={onClose} busy={isSubmitting}>
      <form className="space-y-4" onSubmit={(event) => {
        event.preventDefault();
        if (reason.trim() && !isSubmitting) onConfirm();
      }}>
        <label className="block">{appointmentCopy.cancellationReason}{" "}<textarea className="mt-1 block w-full rounded-md border border-line bg-surface p-3" autoFocus
            value={reason} rows={4} maxLength={cancellationReasonMaxLength} disabled={isSubmitting}
            onChange={(event) => onReasonChange(event.target.value)} />
        </label>
        <p className="text-sm text-muted-ink">{reason.length}/{cancellationReasonMaxLength}</p>
        {error && <p role="alert" className="text-red-300">{error}</p>}
        <div className="flex flex-wrap justify-end gap-4">
          <button type="button" disabled={isSubmitting} onClick={onClose}>{appointmentCopy.keepAppointment}</button>
          <button type="submit" disabled={!reason.trim() || isSubmitting}>
            {isSubmitting ? appointmentCopy.cancelling : appointmentCopy.confirmCancellation}
          </button>
        </div>
      </form>
    </Modal>
  );
}
