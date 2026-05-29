import { useEffect, useRef } from 'react';
import './ConfirmModal.css';

const AlertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

/**
 * ConfirmModal
 *
 * Reusable confirmation dialog.
 *
 * Props:
 *   title          {string}   - Modal heading
 *   message        {string}   - Explanatory text
 *   confirmLabel   {string}   - Confirm button text (default: "Confirm")
 *   cancelLabel    {string}   - Cancel button text (default: "Cancel")
 *   onConfirm      {fn}       - Called on confirm click
 *   onCancel       {fn}       - Called on cancel or backdrop/Escape
 *   danger         {boolean}  - Use red confirm button (default: false)
 *   loading        {boolean}  - Disables buttons while async action runs
 */
export default function ConfirmModal({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
  loading = false,
}) {
  const cancelRef = useRef(null);

  // Focus cancel button on open (safer default for destructive actions)
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  // Escape key closes
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="confirm-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-msg"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel?.(); }}
    >
      <div className="confirm-modal">
        <div className={`confirm-modal-icon confirm-modal-icon--${danger ? 'danger' : 'warning'}`}>
          <AlertIcon />
        </div>

        <h2 id="confirm-title" className="confirm-modal-title">{title}</h2>
        {message && (
          <p id="confirm-msg" className="confirm-modal-message">{message}</p>
        )}

        <div className="confirm-modal-actions">
          <button
            ref={cancelRef}
            className="confirm-btn-cancel"
            onClick={onCancel}
            disabled={loading}
            aria-label={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            id="confirm-action-btn"
            className={`confirm-btn-confirm confirm-btn-confirm--${danger ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={loading}
            aria-label={confirmLabel}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
