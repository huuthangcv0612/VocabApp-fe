import React from 'react'
import { useTranslation } from 'react-i18next'

interface AdminErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title,
  message,
  onRetry,
}) => {
  const { t } = useTranslation('common')
  return (
    <div className="admin-error-state">
      <div className="admin-error-icon">⚠️</div>
      <div className="admin-error-content">
        <h4 className="admin-error-title">{title || t('states.error')}</h4>
        <p className="admin-error-message">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-admin-secondary admin-retry-btn">
          🔄 {t('actions.retry')}
        </button>
      )}
    </div>
  )
}

export default AdminErrorState
