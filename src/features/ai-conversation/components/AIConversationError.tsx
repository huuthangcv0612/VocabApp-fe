import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface AIConversationErrorProps {
  message?: string | null
  statusCode?: number | null
  onRetry?: () => void
  onExit: () => void
}

export const AIConversationError: React.FC<AIConversationErrorProps> = ({
  message,
  statusCode,
  onRetry,
  onExit,
}) => {
  const { t } = useTranslation(['ai', 'common'])
  const navigate = useNavigate()

  const isPremiumRequired = statusCode === 403

  const getErrorMessageForStatus = (code?: number | null, customMsg?: string | null): string => {
    if (customMsg) return customMsg
    switch (code) {
      case 401:
        return t('conversation.err401')
      case 400:
        return t('conversation.err400')
      case 404:
        return t('conversation.err404')
      case 403:
        return t(
          'common:premiumModal.content',
          'Chế độ học AI chỉ dành cho tài khoản Premium. Hãy đăng ký gói Premium để mở khóa tính năng này.',
        )
      case 409:
        return t('conversation.err409')
      case 429:
        return t('conversation.err429')
      case 500:
      default:
        return t('conversation.errDefault')
    }
  }

  const displayMsg = getErrorMessageForStatus(statusCode, message)

  if (isPremiumRequired) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '60px 24px',
          maxWidth: '520px',
          margin: '40px auto',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #fed7aa',
          boxShadow: '0 12px 35px rgba(245, 158, 11, 0.12)',
        }}
      >
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #fbbf24',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            boxShadow: '0 8px 16px rgba(245, 158, 11, 0.2)',
          }}
        >
          🔒
        </div>
        <h3
          style={{
            fontFamily: 'Oswald, sans-serif',
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            marginBottom: '12px',
            textTransform: 'uppercase',
          }}
        >
          {t('common:premiumModal.title', '🔒 Tính năng Premium')}
        </h3>
        <p
          style={{
            color: '#475569',
            fontSize: '1rem',
            marginBottom: '28px',
            lineHeight: 1.6,
          }}
        >
          {displayMsg}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onExit}
            className="btn-admin-secondary"
            style={{ padding: '12px 24px', borderRadius: '9999px', minWidth: '120px' }}
          >
            {t('common:premiumModal.closeBtn', 'Đóng')}
          </button>

          <button
            onClick={() => navigate('/pricing')}
            className="btn-admin-primary"
            style={{
              padding: '12px 28px',
              borderRadius: '9999px',
              minWidth: '160px',
              backgroundColor: '#2a63e8',
              boxShadow: '0 4px 14px rgba(42,99,232,0.3)',
            }}
          >
            ✨ {t('common:premiumModal.upgradeBtn', 'Đăng ký Premium')}
          </button>
        </div>
      </div>
    )
  }

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
        {t('conversation.errorTitle')}
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
            {t('conversation.retryBtn')}
          </button>
        )}

        <button
          onClick={onExit}
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', borderRadius: '9999px' }}
        >
          {t('conversation.backToPathBtn')}
        </button>
      </div>
    </div>
  )
}

export default AIConversationError
