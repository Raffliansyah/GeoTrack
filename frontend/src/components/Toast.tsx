type ToastProps = {
  message: string
  type: 'success' | 'info' | 'delete' | 'error'
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  const icon =
    type === 'success' ? '✓' :
    type === 'info' ? '✎' :
    type === 'delete' ? '✕' : '!'

  return (
    <div
      className={`toast toast-${type}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      <div className="toast-icon">
        {icon}
      </div>

      <div className="toast-message">
        {message}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Tutup notifikasi"
      >
        ×
      </button>
    </div>
  )
}

export default Toast