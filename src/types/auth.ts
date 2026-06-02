export interface AuthUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

export interface AuthResponse<T = any> {
  success: boolean
  token?: string
  user?: T
  data?: T
  error?: string
}
