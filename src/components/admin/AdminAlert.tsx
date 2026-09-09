type AdminAlertProps = {
  type: 'success' | 'error';
  message: string;
  onDismiss?: () => void;
};

export default function AdminAlert({ type, message, onDismiss }: AdminAlertProps) {
  return (
    <div className={`admin-alert admin-alert--${type}`} role="alert">
      <span>{message}</span>
      {onDismiss && (
        <button type="button" className="admin-alert__dismiss" onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
