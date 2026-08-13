import { useEffect, useRef } from "react";

interface CancellationModalProps {
  reason: string;
  error: string;
  isSubmitting: boolean;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

const CancellationModal = ({
  reason,
  error,
  isSubmitting,
  onReasonChange,
  onConfirm,
  onClose,
}: CancellationModalProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const trimmedReason = reason.trim();
  const isConfirmDisabled =
    !trimmedReason || isSubmitting;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        className="cancellation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancellation-modal-title"
        aria-describedby="cancellation-modal-description"
      >
        <h2 id="cancellation-modal-title">
          Cancel appointment
        </h2>

        <p id="cancellation-modal-description">
          Please provide a reason for cancelling this appointment.
        </p>

        <label htmlFor="cancellation-reason">
          Cancellation reason
        </label>

        <textarea
          ref={textareaRef}
          id="cancellation-reason"
          value={reason}
          rows={4}
          maxLength={500}
          disabled={isSubmitting}
          placeholder="Enter the reason for cancellation"
          onChange={(event) => onReasonChange(event.target.value)}
        />

        <p>
          {reason.length}/500
        </p>

        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Keep appointment
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          >
            {isSubmitting
              ? "Cancelling..."
              : "Confirm cancellation"}
          </button>
        </div>
      </section>
    </div>
  );
};

export default CancellationModal;