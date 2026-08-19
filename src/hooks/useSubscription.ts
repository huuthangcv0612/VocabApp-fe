import { useEffect, useState } from 'react'
import { subscriptionService } from '../services/subscriptionService'
import type { UserSubscription } from '../types/gamification'

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
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
  }, [])

  const isPremium = Boolean(subscription?.isPremium)

  return { subscription, isPremium, loading }
}

export default useSubscription
