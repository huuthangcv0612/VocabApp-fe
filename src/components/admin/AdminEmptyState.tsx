import React from 'react'

interface AdminEmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon = '📭',
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại chưa có mục nào được tìm thấy hoặc danh sách đang trống.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-icon">{icon}</div>
      <h3 className="admin-empty-title">{title}</h3>
      <p className="admin-empty-desc">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-admin-primary admin-empty-btn">
          ➕ {actionLabel}
        </button>
      )}
    </div>
  )
}

export default AdminEmptyState
