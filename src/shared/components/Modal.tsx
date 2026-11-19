import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";

export default function Modal({ title, children, onClose, busy = false, fallbackFocus }: {
  title: string; children: ReactNode; onClose: () => void; busy?: boolean; fallbackFocus?: RefObject<HTMLElement | null>;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    const fallback = fallbackFocus?.current;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
      else if (fallback?.isConnected) fallback.focus();
    };
  }, [fallbackFocus]);
  return (
    <dialog ref={dialog} aria-labelledby={id}
      className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-xl border border-line bg-panel p-6 text-ink backdrop:bg-black/70"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}>
      <h2 id={id} className="mb-4 text-xl font-semibold wrap-anywhere">{title}</h2>
      {children}
    </dialog>
  );
}
