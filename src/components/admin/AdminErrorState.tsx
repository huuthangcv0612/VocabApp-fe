import React from 'react'

interface AdminErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export const AdminErrorState: React.FC<AdminErrorStateProps> = ({
  title = 'Đã có lỗi xảy ra',
  message,
  onRetry,
}) => {
  return (
    <div className="admin-error-state">
      <div className="admin-error-icon">⚠️</div>
      <div className="admin-error-content">
        <h4 className="admin-error-title">{title}</h4>
        <p className="admin-error-message">{message}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn-admin-secondary admin-retry-btn">
          🔄 Thử lại
        </button>
      )}
    </div>
  )
}

export default AdminErrorState
