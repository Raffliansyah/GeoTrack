
type DeleteConfirmModalProps = {
  entityName: string
  isDeleting: boolean
  step: 1 | 2
  onCancel: () => void
  onBack: () => void
  onConfirm: () => void
}

function DeleteConfirmModal({
  entityName,
  isDeleting,
  step,
  onCancel,
  onBack,
  onConfirm,
}: DeleteConfirmModalProps) {
  const isFinalStep = step === 2

  return (
    <div className="modal-overlay">
      <div
        className="delete-confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <div className="delete-modal-icon">
          {isFinalStep ? '⚠️' : '🗑️'}
        </div>

        <h2 id="delete-modal-title">
          {isFinalStep
            ? 'Konfirmasi Terakhir!'
            : 'Hapus Entitas?'}
        </h2>

        <p id="delete-modal-description">
          {isFinalStep ? (
            <>
              Kamu akan menghapus entitas{' '}
              <strong>"{entityName}"</strong>{' '}
              secara permanen.
            </>
          ) : (
            <>
              Apakah kamu yakin ingin menghapus{' '}
              <strong>"{entityName}"</strong>?
            </>
          )}
        </p>

        <p className="delete-modal-warning">
          {isFinalStep
            ? 'Ini adalah konfirmasi terakhir. Data tidak dapat dikembalikan melalui aplikasi.'
            : 'Kamu akan diminta melakukan konfirmasi sekali lagi sebelum data dihapus.'}
        </p>

        <div className="delete-modal-actions">
          <button
            type="button"
            className="delete-cancel-btn"
            onClick={isFinalStep ? onBack : onCancel}
            disabled={isDeleting}
          >
            {isFinalStep ? 'Kembali' : 'Batal'}
          </button>

          <button
            type="button"
            className="delete-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting
              ? 'Menghapus...'
              : isFinalStep
                ? 'Hapus Permanen'
                : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal