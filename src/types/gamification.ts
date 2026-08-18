export type SubscriptionPlanId = 'free' | 'premium' | 'pro'

export type SubscriptionStatus = 'active' | 'expired' | 'canceled'

export interface UserStreak {
  current_streak: number
  longest_streak: number
  last_activity_date?: string
}

export interface AchievementItem {
  _id: string
  code: string
  title: string
  description: string
  icon: string
  target_value: number
  xp_reward: number
  unlocked: boolean
  progress: number
  unlocked_at?: string
}

export interface SubscriptionPackage {
  id: SubscriptionPlanId
  name: string
  price: number
  currency: 'VND' | 'USD'
  duration_months: number
  features: string[]
  badge?: string
}

export interface UserSubscription {
  plan_id: SubscriptionPlanId
  plan_name: string
  status: SubscriptionStatus
  start_date: string
  end_date: string
  features: string[]
}

export interface PaymentTransaction {
  _id: string
  user: string
  planId: SubscriptionPlanId
  amount: number
  currency: string
  payment_method: 'vietqr' | 'momo' | 'zalopay' | 'stripe'
  payment_code: string
  status: 'pending' | 'completed' | 'failed'
  qr_url?: string
  created_at: string
  verified_at?: string
}
