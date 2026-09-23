import React from 'react'
import { useTranslation } from 'react-i18next'

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
  title,
  message,
  itemName,
  confirmText,
  cancelText,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation('common')
  if (!isOpen) return null

  const displayTitle = title || t('modals.confirmDeleteTitle')
  const displayConfirm = confirmText || t('modals.permanentDelete')
  const displayCancel = cancelText || t('actions.cancel')

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <div className="confirm-modal-icon">🗑️</div>
          <h3 className="modal-title">{displayTitle}</h3>
        </div>

        <div className="confirm-modal-body">
          <p>{message}</p>
          {itemName && (
            <div className="confirm-item-badge">
              <strong>{itemName}</strong>
            </div>
          )}
          <p className="confirm-warning-note">{t('modals.confirmDeleteWarning')}</p>
        </div>

        <div className="confirm-modal-actions">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-admin-secondary"
          >
            {displayCancel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="btn-admin-danger"
          >
            {isLoading ? t('actions.loading') : displayConfirm}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
