import React from 'react'
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
  const { t } = useTranslation('ai')

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
        return t('conversation.err403')
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
