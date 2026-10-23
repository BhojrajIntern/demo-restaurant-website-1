"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "../icons";
import { useScrollLock } from "./hooks";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Accessible dialog: traps focus, closes on Escape or backdrop click, restores focus afterwards. */
export function Modal({ open, onClose, label, wide, children, closeButton = true }: {
  open: boolean;
  onClose: () => void;
  label: string;
  wide?: boolean;
  children: ReactNode;
  closeButton?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>(".dialog-close") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    }, 50);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <>
      <div className="scrim is-open" style={{ zIndex: 125 }} onClick={onClose} />
      <div className="dialog is-open" role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`dialog-panel ${wide ? "wide" : ""}`} ref={panel}>
          {closeButton && (
            <button className="icon-btn dialog-close" onClick={onClose} aria-label="Close"><CloseIcon size={21} /></button>
          )}
          {children}
        </div>
      </div>
    </>
  );
}
