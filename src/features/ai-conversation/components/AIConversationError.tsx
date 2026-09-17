import React from 'react'

interface AIConversationErrorProps {
  message?: string | null
  statusCode?: number | null
  onRetry?: () => void
  onExit: () => void
}

const getErrorMessageForStatus = (statusCode?: number | null, customMsg?: string | null): string => {
  if (customMsg) return customMsg
  switch (statusCode) {
    case 401:
      return 'Vui lòng đăng nhập để sử dụng AI.'
    case 400:
      return 'Không thể bắt đầu hội thoại cho bài học này.'
    case 404:
      return 'Hội thoại hoặc bài học không tồn tại.'
    case 403:
      return 'Bạn không có quyền truy cập hội thoại này.'
    case 409:
      return 'Hội thoại đã hoàn thành.'
    case 429:
      return 'AI đang quá tải hoặc đã đạt giới hạn API. Vui lòng thử lại sau.'
    case 500:
    default:
      return 'Đã xảy ra lỗi khi kết nối với AI.'
  }
}

export const AIConversationError: React.FC<AIConversationErrorProps> = ({
  message,
  statusCode,
  onRetry,
  onExit,
}) => {
  const displayMsg = getErrorMessageForStatus(statusCode, message)

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '60px 20px',
        maxWidth: '520px',
        margin: '40px auto',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #fee2e2',
        boxShadow: '0 8px 30px rgba(239, 68, 68, 0.08)',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>
        Có lỗi xảy ra
      </h3>
      <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '28px', lineHeight: 1.5 }}>
        {displayMsg}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {onRetry && statusCode !== 404 && statusCode !== 401 && (
          <button
            onClick={onRetry}
            className="btn-admin-primary"
            style={{ padding: '12px 24px', borderRadius: '9999px' }}
          >
            Thử lại 🔄
          </button>
        )}

        <button
          onClick={onExit}
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', borderRadius: '9999px' }}
        >
          Về Lộ Trình Học 🏠
        </button>
      </div>
    </div>
  )
}

export default AIConversationError
