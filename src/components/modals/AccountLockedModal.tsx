import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import '../../styles/components/account-locked-modal.css'

export interface AccountLockedModalProps {
  isOpen: boolean
  reason?: string
  lockedAt?: string
  adminContactEmail?: string
  onLoginAnotherAccount: () => void
}

export const AccountLockedModal: React.FC<AccountLockedModalProps> = ({
  isOpen,
  reason,
  lockedAt,
  adminContactEmail,
  onLoginAnotherAccount,
}) => {
  const { t, i18n } = useTranslation('auth')
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Prevent background scrolling and block Escape key
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Focus action button on modal open
    const timer = setTimeout(() => {
      buttonRef.current?.focus()
    }, 50)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Explicitly prevent Escape from closing the modal
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)

    return () => {
      document.body.style.overflow = originalOverflow
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Resolve lock reason with strict fallbacks (Requirement 18)
  const resolvedReason =
    reason && reason.trim().length > 0
      ? reason.trim()
      : t('accountLocked.reasonDefault', 'Lý do khóa chưa được cung cấp.')

  // Format lockedAt timestamp if available
  let formattedLockedAt: string | null = null
  if (lockedAt) {
    try {
      const date = new Date(lockedAt)
      if (!isNaN(date.getTime())) {
        const locale = i18n.language === 'en' ? 'en-US' : 'vi-VN'
        formattedLockedAt = date.toLocaleString(locale, {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }
    } catch {
      formattedLockedAt = null
    }
  }

  return (
    <div
      className="alm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-locked-title"
      aria-describedby="account-locked-desc"
      onClick={(e) => {
        // Prevent clicking backdrop from closing the modal
        e.stopPropagation()
      }}
    >
      <div
        className="alm-modal"
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        {/* Warning / Lock Icon */}
        <div className="alm-icon-wrapper" aria-hidden="true">
          <svg
            className="alm-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        {/* Title */}
        <h2 id="account-locked-title" className="alm-title">
          {t('accountLocked.title', 'Tài khoản bị khóa')}
        </h2>

        {/* Subtitle / Message */}
        <p id="account-locked-desc" className="alm-message">
          {t('accountLocked.message', 'Tài khoản của bạn hiện đang bị khóa.')}
        </p>

        {/* Reason Box */}
        <div className="alm-reason-card">
          <div className="alm-reason-header">
            <span className="alm-reason-tag">
              ⚠️ {t('accountLocked.reasonTitle', 'Lý do khóa')}
            </span>
          </div>
          <p className="alm-reason-text">{resolvedReason}</p>
          {formattedLockedAt && (
            <div className="alm-locked-at">
              <span>🕒 {t('accountLocked.lockedAtLabel', 'Thời gian khóa')}:</span>
              <strong>{formattedLockedAt}</strong>
            </div>
          )}
        </div>

        {/* Admin Support Box */}
        <div className="alm-support-card">
          <div className="alm-support-title">
            {t('accountLocked.supportTitle', 'Cần hỗ trợ?')}
          </div>
          <p className="alm-support-desc">
            {t(
              'accountLocked.supportDesc',
              'Vui lòng liên hệ quản trị viên để được hỗ trợ.',
            )}
          </p>
          {adminContactEmail && (
            <a
              href={`mailto:${adminContactEmail}?subject=${encodeURIComponent('Yêu cầu hỗ trợ mở khóa tài khoản DeutschUp')}`}
              className="alm-support-email"
            >
              ✉️ {adminContactEmail}
            </a>
          )}
        </div>

        {/* Action Button */}
        <div className="alm-actions">
          <button
            ref={buttonRef}
            type="button"
            className="alm-btn-switch"
            onClick={onLoginAnotherAccount}
          >
            {t('accountLocked.loginAnotherBtn', 'Đăng nhập bằng tài khoản khác')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountLockedModal
