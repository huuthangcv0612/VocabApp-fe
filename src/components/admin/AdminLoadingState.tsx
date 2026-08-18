import React from 'react'

interface AdminLoadingStateProps {
  message?: string
}

export const AdminLoadingState: React.FC<AdminLoadingStateProps> = ({
  message = 'Đang tải dữ liệu...',
}) => {
  return (
    <div className="admin-loading-state">
      <div className="admin-spinner"></div>
      <p className="admin-loading-text">{message}</p>
    </div>
  )
}

export default AdminLoadingState
