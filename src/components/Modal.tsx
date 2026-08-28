import { useEffect, useRef, type ReactNode } from "react";
import { XIcon } from "./icons";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Tracks mounted modals so that when one is stacked on top of another
// (e.g. a ConfirmDialog opened from within a detail modal), only the
// topmost one responds to Escape/Tab instead of both firing at once.
let nextModalId = 0;
const openModalIds: number[] = [];

export function Modal({ title, onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const idRef = useRef<number>();
  if (idRef.current === undefined) {
    nextModalId += 1;
    idRef.current = nextModalId;
  }

  useEffect(() => {
    const id = idRef.current!;
    openModalIds.push(id);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    if (modalRef.current && !modalRef.current.contains(document.activeElement)) {
      modalRef.current.focus();
    }

    function isTopmost() {
      return openModalIds[openModalIds.length - 1] === id;
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (!isTopmost()) return;
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const i = openModalIds.indexOf(id);
      if (i !== -1) openModalIds.splice(i, 1);
      previouslyFocused?.focus();
    };
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close">
            <XIcon />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
