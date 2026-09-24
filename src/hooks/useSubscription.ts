import { useEffect, useState, useMemo } from 'react'
import { subscriptionService } from '../services/subscriptionService'
import type { UserSubscription } from '../types/gamification'
import { useAuth } from '../contexts/AuthContext'
import type { AuthUser } from '../types/auth'

/**
 * Safely evaluates if the user possesses Premium access.
 * Returns false (fail-closed) if user or subscription is null, undefined,
 * or in case of network/data error.
 */
export const checkIsPremium = (
  user: AuthUser | null | undefined,
  subscription?: UserSubscription | null,
): boolean => {
  if (!user) return false

  // 1. Admin bypass
  const role = (user.role || '').toLowerCase()
  const userRecord = user as Record<string, unknown>
  if (role === 'admin' || userRecord?.isAdmin === true) {
    return true
  }

  // 2. Direct user plan flags
  const plan = (user.plan || '').toString().toUpperCase()
  if (plan === 'PREMIUM' || plan === 'CUSTOM' || plan === 'ADMIN') {
    return true
  }

  // 3. Custom plan flag on user
  if (user.hasCustomPlan === true || userRecord?.hasCustomPlan === true) {
    return true
  }

  // 4. Subscription object flags from /subscriptions/current
  if (subscription) {
    if (subscription.isPremium === true || subscription.isCustom === true) {
      return true
    }
    const subPlanName = (subscription.plan_name || subscription.plan_id || '').toUpperCase()
    if (subPlanName.includes('PREMIUM') || subPlanName.includes('CUSTOM')) {
      return true
    }
  }

  // 5. User nested subscription object
  if (user.subscription) {
    const userSubPlan = (user.subscription.plan_name || user.subscription.plan_id || '').toString().toUpperCase()
    if (userSubPlan.includes('PREMIUM') || userSubPlan.includes('CUSTOM')) {
      return true
    }
  }

  // Default: fail-closed (Free)
  return false
}

export const useSubscription = () => {
  const { user, isAuthenticated } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true

    if (!isAuthenticated || !user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    setLoading(true)
    subscriptionService
      .getCurrentSubscription()
      .then((data) => {
        if (isMounted) setSubscription(data)
      })
      .catch(() => {
        if (isMounted) setSubscription(null)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user])

  const isPremium = useMemo(() => {
    return checkIsPremium(user, subscription)
  }, [user, subscription])

  return { subscription, isPremium, loading }
}

export default useSubscription
