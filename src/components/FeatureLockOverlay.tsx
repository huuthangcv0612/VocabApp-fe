import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

interface FeatureLockOverlayProps {
  title?: string
  description?: string
  requiredPlan?: 'Premium' | 'Pro'
}

export const FeatureLockOverlay: React.FC<FeatureLockOverlayProps> = ({
  title,
  description,
  requiredPlan = 'Premium',
}) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  const displayTitle = title || t('lock.premiumFeature')
  const displayDesc = description || t('lock.upgradeRequired')

  return (
    <div
      style={{
        padding: '36px',
        borderRadius: '24px',
        backgroundColor: '#fff',
        border: '2px dashed #cbd5e1',
        textAlign: 'center',
        boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
        margin: '20px 0',
      }}
    >
      <div style={{ fontSize: '3.2rem', marginBottom: '12px' }}>🔒</div>
      <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
        {displayTitle}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
        {displayDesc}
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn-admin-primary"
          style={{
            padding: '12px 28px',
            borderRadius: '9999px',
            fontSize: '1rem',
            backgroundColor: '#2a63e8',
            boxShadow: '0 4px 14px rgba(42,99,232,0.3)',
          }}
          onClick={() => navigate('/pricing')}
        >
          ✨ {t('lock.upgradeNow')} ({requiredPlan})
        </button>

        <button
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', borderRadius: '9999px', fontSize: '0.92rem' }}
          onClick={() => navigate('/subscription')}
        >
          {t('lock.viewSubscription')}
        </button>
      </div>
    </div>
  )
}

export default FeatureLockOverlay
