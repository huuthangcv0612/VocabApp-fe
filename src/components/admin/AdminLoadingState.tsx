import React from 'react'
import { useTranslation } from 'react-i18next'

interface AdminLoadingStateProps {
  message?: string
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message,
}) => {
  const { t } = useTranslation('common')
  return (
    <div className="admin-loading-state">
      <div className="admin-spinner"></div>
      <p className="admin-loading-text">{message || t('states.loadingData')}</p>
    </div>
  )
}

export default AdminLoadingState
