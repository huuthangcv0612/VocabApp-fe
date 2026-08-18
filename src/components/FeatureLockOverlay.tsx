import React from 'react'
import { useNavigate } from 'react-router-dom'

interface FeatureLockOverlayProps {
  title?: string
  description?: string
  requiredPlan?: 'Premium' | 'Pro'
}

export const FeatureLockOverlay: React.FC<FeatureLockOverlayProps> = ({
  title = '🔒 Tính Năng Nâng Cao (Premium Feature)',
  description = 'Tính năng này yêu cầu nâng cấp Gói Premium hoặc Pro để truy cập.',
  requiredPlan = 'Premium',
}) => {
  const navigate = useNavigate()

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
        {title}
      </h3>
      <p style={{ color: '#64748b', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
        {description}
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
          ✨ Nâng Cấp Gói {requiredPlan} Ngay
        </button>

        <button
          className="btn-admin-secondary"
          style={{ padding: '12px 24px', borderRadius: '9999px', fontSize: '0.92rem' }}
          onClick={() => navigate('/subscription')}
        >
          Xem Trạng Thái Gói
        </button>
      </div>
    </div>
  )
}

export default FeatureLockOverlay
