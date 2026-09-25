import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { AccountLockedModal } from './AccountLockedModal'
import { ADMIN_CONTACT_EMAIL } from '../../config/contact'

export const GlobalAccountLockedModal: React.FC = () => {
  const {
    isAuthenticated,
    user,
    isAccountLocked,
    accountLockReason,
    accountLockedAt,
    logout,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isLocked = Boolean(isAuthenticated && isAccountLocked)

  useEffect(() => {
    // When account is locked, ensure the user is routed to Home so Home is rendered behind the modal
    if (isLocked && location.pathname !== '/') {
      navigate('/', { replace: true })
    }
  }, [isLocked, location.pathname, navigate])

  const handleLoginAnotherAccount = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <AccountLockedModal
      isOpen={isLocked}
      reason={accountLockReason || user?.lockReason}
      lockedAt={accountLockedAt || user?.lockedAt}
      adminContactEmail={ADMIN_CONTACT_EMAIL}
      onLoginAnotherAccount={handleLoginAnotherAccount}
    />
  )
}

export default GlobalAccountLockedModal
