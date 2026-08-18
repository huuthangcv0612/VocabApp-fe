import React from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  message: string
  itemName?: string
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title = 'Xác nhận xóa',
  message,
  itemName,
  confirmText = 'Xóa vĩnh viễn',
  cancelText = 'Hủy bỏ',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">🗑️</div>
          <h3 className="modal-title">{title}</h3>
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
          {itemName && (
            <div className="confirm-item-badge">
              <strong>{itemName}</strong>
            </div>
          )}
          <p className="confirm-warning-note">⚠️ Hành động này không thể hoàn tác.</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-admin-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-admin-danger"
          >
            {isLoading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
