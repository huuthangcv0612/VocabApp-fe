import type { PaginationMeta } from './admin'

export interface ApiResponse<T> {
  success: boolean
  message?: string
  statusCode?: number
  data: T
  error?: string
}

export interface PaginatedData<T> {
  docs?: T[]
  items?: T[]
  vocabularies?: T[]
  levels?: T[]
  topics?: T[]
  units?: T[]
  lessons?: T[]
  exercises?: T[]
  pagination?: PaginationMeta
  total?: number
  page?: number
  limit?: number
  pages?: number
}

export type PaginatedResponse<T> = ApiResponse<PaginatedData<T> | T[]>

export interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('response' in error && error.response && typeof error.response === 'object') {
      const resData = (error.response as { data?: { error?: string; message?: string } }).data
      if (resData?.error) return resData.error
      if (resData?.message) return resData.message
    }
    if ('message' in error && typeof error.message === 'string') {
      return error.message
    }
  }
  return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
}
