export interface AuthUser {
  _id: string
  id?: string
  name: string
  username?: string
  email: string
  role: 'user' | 'admin'
  avatar?: string | null
  isEmailVerified?: boolean
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
