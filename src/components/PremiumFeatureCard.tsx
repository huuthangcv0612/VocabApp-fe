import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/components/premium-feature-card.css'

export interface PremiumFeatureCardProps {
  title: string
  description?: string
  isPremium: boolean
  isLocked?: boolean
  onStart?: () => void
  buttonLabel?: string
}

export const PremiumFeatureCard: React.FC<PremiumFeatureCardProps> = ({
  title,
  description,
  isPremium,
  isLocked,
  onStart,
  buttonLabel = 'Bắt đầu',
}) => {
  const navigate = useNavigate()

  // Lock if explicitly requested via isLocked, or if user is not Premium
  const locked = isLocked !== undefined ? isLocked : !isPremium

  const handleButtonClick = () => {
    if (locked) {
      navigate('/pricing')
    } else if (onStart) {
      onStart()
    }
  }

  return (
    <div className={`premium-feature-card ${locked ? 'locked' : 'unlocked'}`}>
      <h3 className="pfc-title">{title}</h3>

      <div className="pfc-badge-container">
        {locked ? (
          <div className="pfc-lock-badge">
            <span className="pfc-lock-icon">🔒</span> Premium
          </div>
        ) : (
          <div className="pfc-check-badge">✓</div>
        )}
      </div>

      <p className="pfc-description">
        {locked ? description || 'Mở khóa với Premium' : description || 'Sẵn sàng học ngay'}
      </p>

      <button
        type="button"
        className={`pfc-button ${locked ? 'btn-upgrade' : 'btn-start'}`}
        onClick={handleButtonClick}
      >
        {locked ? 'Nâng cấp ngay' : buttonLabel}
      </button>
    </div>
  )
}

export default PremiumFeatureCard
