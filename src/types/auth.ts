import type { UserPlan } from './plan'

export type AccountStatus = 'active' | 'locked' | string

export interface AuthUser {
  _id: string
  id?: string
  name: string
  username?: string
  email: string
  role: 'user' | 'admin' | 'teacher' | string
  avatar?: string | null
  isEmailVerified?: boolean
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | string
  plan?: UserPlan | string
  plan_id?: string
  subscription?: {
    plan_id?: string
    plan_name?: string
    status?: string
    [key: string]: unknown
  }
  permissions?: string[]
  hasCustomPlan?: boolean
  canManageClasses?: boolean
  can_create_class?: boolean
  isTeacher?: boolean
  status?: AccountStatus
  lockReason?: string
  lockedAt?: string
  [key: string]: unknown
}

export interface AuthResponse<T = unknown> {
  success: boolean
  message?: string
  statusCode?: number
  token?: string
  user?: T
  data?: T | { token?: string; user?: T }
  error?: string
}
