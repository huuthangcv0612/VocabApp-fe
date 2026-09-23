import React from 'react'
import { useTranslation } from 'react-i18next'

interface AdminEmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}) => {
  const { t } = useTranslation('common')
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon">{icon}</div>
      <h3 className="admin-empty-title">{title || t('states.empty')}</h3>
      <p className="admin-empty-desc">{description || t('states.emptyDesc')}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-admin-primary admin-empty-btn">
          ➕ {actionLabel}
        </button>
      )}
    </div>
  )
}

export default AdminEmptyState
