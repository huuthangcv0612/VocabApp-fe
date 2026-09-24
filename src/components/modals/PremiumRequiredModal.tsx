import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import '../../styles/components/premium-required-modal.css'

export interface PremiumRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  planType?: 'PREMIUM' | 'CUSTOM'
  title?: string
  content?: string
  upgradeButtonText?: string
  closeButtonText?: string
  targetRoute?: string
  icon?: string
  onUpgrade?: () => void
}

export const PremiumRequiredModal: React.FC<PremiumRequiredModalProps> = ({
  isOpen,
  onClose,
  planType = 'PREMIUM',
  title,
  content,
  upgradeButtonText,
  closeButtonText,
  targetRoute = '/pricing',
  icon,
  onUpgrade,
}) => {
  const { t } = useTranslation('common')
  const navigate = useNavigate()

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isCustom = planType === 'CUSTOM'

  const displayIcon = icon || (isCustom ? '⭐' : '🔒')
  const displayTitle =
    title ||
    (isCustom
      ? t('customModal.title', '⭐ Tính năng Gói Custom')
      : t('premiumModal.title', '🔒 Tính năng Premium'))
  const displayContent =
    content ||
    (isCustom
      ? t(
          'customModal.content',
          'Tính năng tạo và quản lý lớp học tương tác chỉ dành cho tài khoản gói Custom. Hãy nâng cấp gói Custom để mở khóa tính năng này.',
        )
      : t(
          'premiumModal.content',
          'Chế độ học AI chỉ dành cho tài khoản Premium. Hãy đăng ký gói Premium để mở khóa tính năng này.',
        ))
  const displayUpgradeText =
    upgradeButtonText ||
    (isCustom
      ? t('customModal.upgradeBtn', 'Khám phá Gói Custom')
      : t('premiumModal.upgradeBtn', 'Đăng ký Premium'))
  const displayCloseText =
    closeButtonText ||
    (isCustom
      ? t('customModal.closeBtn', 'Đóng')
      : t('premiumModal.closeBtn', 'Đóng'))

  const handleUpgradeClick = () => {
    onClose()
    if (onUpgrade) {
      onUpgrade()
    } else {
      navigate(targetRoute)
    }
  }

  return (
    <div className="prm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="prm-modal" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="prm-close-icon"
          onClick={onClose}
          aria-label={displayCloseText}
        >
          ✕
        </button>

        <div className={`prm-icon-wrapper ${isCustom ? 'prm-icon-wrapper--custom' : ''}`}>
          <span>{displayIcon}</span>
        </div>

        <h3 className="prm-title">{displayTitle}</h3>

        <p className="prm-content">{displayContent}</p>

        <div className="prm-actions">
          <button
            type="button"
            className="prm-btn prm-btn-close"
            onClick={onClose}
          >
            {displayCloseText}
          </button>

          <button
            type="button"
            className={`prm-btn prm-btn-upgrade ${isCustom ? 'prm-btn-upgrade--custom' : ''}`}
            onClick={handleUpgradeClick}
          >
            ✨ {displayUpgradeText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PremiumRequiredModal
