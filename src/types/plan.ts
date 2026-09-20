export type PlanType = 'FREE' | 'PREMIUM' | 'CUSTOM'
export type UserPlan = PlanType | 'ADMIN'

export interface Plan {
  _id: string
  name: string
  code: string
  price: number
  durationDays: number
  description?: string
  features: string[]
  permissions: string[]
  planType: PlanType
  isActive?: boolean
  sortOrder?: number
  badge?: string
  // Compatibility fields for legacy components
  id: string
  duration_months?: number
}

export type PlanItem = Plan

export interface PlansResponseData {
  plans: Plan[]
}
