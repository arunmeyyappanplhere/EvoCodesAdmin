import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Shared modal shell used for the edit forms on Clients / Services / Blogs.
 *
 * <Modal open={open} onClose={...} title="Edit Client" footer={<...buttons>}>
 *   ...form fields...
 * </Modal>
 *
 * Rendered via a portal into document.body so it can never be clipped or
 * mispositioned by an ancestor with `overflow-hidden`, `transform`,
 * `filter`, or similar properties that create a new containing block.
 */
export default function Modal({ open, onClose, title, subtitle, children, footer }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 bg-slate-900/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Labeled text/select input, styled to match the modal fields. */
export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";

export const selectClass = inputClass + " appearance-none";