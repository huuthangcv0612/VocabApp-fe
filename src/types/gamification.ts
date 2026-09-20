import type { PlanType } from './plan'

export type SubscriptionPlanId = 'free' | 'premium' | 'custom' | 'pro' | string

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
  id: SubscriptionPlanId | string
  _id?: string
  name: string
  code?: string
  price: number
  currency?: 'VND' | 'USD' | string
  durationDays?: number
  duration_months?: number
  features: string[]
  permissions?: string[]
  planType?: PlanType
  badge?: string
}

export interface UserSubscription {
  plan_id: SubscriptionPlanId | string
  plan_name: string
  status: SubscriptionStatus | string
  start_date: string
  end_date: string
  features: string[]
  isPremium?: boolean
  isCustom?: boolean
  hasCustomPlan?: boolean
  canManageClasses?: boolean
  can_create_class?: boolean
  daysRemaining?: number
  [key: string]: unknown
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

export interface OrderInfo {
  id: string
  orderCode: string
  amount: number
  status: string
  planName?: string
}

export interface PaymentDetails {
  qrCodeUrl: string
  accountName: string
  accountNumber: string
  bankName?: string
  transferContent: string
}

export interface CreateOrderResponse {
  order: OrderInfo
  payment: PaymentDetails
}
