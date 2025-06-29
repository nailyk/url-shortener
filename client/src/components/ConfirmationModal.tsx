type ConfirmationModalProps = {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmationModal({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Yes, delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="modal-close" onClick={onCancel} aria-label="Close">
          &times;
        </button>
        <div className="modal-title">{title}</div>
        <div style={{ textAlign: "center" }}>{message}</div>
        <div className="modal-actions">
          <button className="app-button app-button-delete" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button className="app-button" onClick={onCancel}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
