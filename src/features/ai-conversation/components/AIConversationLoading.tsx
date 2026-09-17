import React from 'react'

export const AIConversationLoading: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        minHeight: '50vh',
      }}
    >
      <div className="admin-spinner" style={{ marginBottom: '16px' }} />
      <p style={{ fontWeight: 700, color: '#475569', fontSize: '1.1rem' }}>
        🤖 Đang khởi tạo hội thoại AI...
      </p>
    </div>
  )
}

export default AIConversationLoading
