import api from './api'
import type { ApiResponse } from '../types/api'
import type {
  SubscriptionPackage,
  UserSubscription,
  CreateOrderResponse,
} from '../types/gamification'

export interface PlanItem {
  _id: string
  name: string
  code?: string
  price: number
  durationDays?: number
  description?: string
  features?: string[]
  badge?: string
  isActive?: boolean
}

export interface BackendOrderResponse {
  order: {
    id: string
    _id?: string
    orderCode: string
    amount: number
    status: string
    expiresAt?: string
    planName?: string
  }
  payment: {
    method?: string
    qrCodeUrl: string
    accountName: string
    accountNumber: string
    bankId?: string
    transferContent: string
  }
}

export interface BackendSubscriptionResponse {
  isPremium: boolean
  subscription: {
    _id: string
    userId: string
    status: string
    startDate: string
    endDate: string
    planId: PlanItem | string
  }
}

export const subscriptionService = {
  createOrder: async (planId: string): Promise<CreateOrderResponse> => {
    const response = await api.post<ApiResponse<BackendOrderResponse>>('/orders', { planId })
    const resData = response.data.data

    return {
      order: {
        id: resData.order.id || resData.order._id || '',
        orderCode: resData.order.orderCode,
        amount: resData.order.amount,
        status: resData.order.status,
        planName: resData.order.planName || 'Premium',
      },
      payment: {
        qrCodeUrl: resData.payment.qrCodeUrl,
        accountName: resData.payment.accountName,
        accountNumber: resData.payment.accountNumber,
        bankName: resData.payment.bankId || 'Ngân Hàng',
        transferContent: resData.payment.transferContent,
      },
    }
  },

  getOrder: async (orderId: string): Promise<CreateOrderResponse> => {
    const response = await api.get<ApiResponse<BackendOrderResponse>>(`/orders/${encodeURIComponent(orderId)}`)
    const resData = response.data.data

    return {
      order: {
        id: resData.order.id || resData.order._id || orderId,
        orderCode: resData.order.orderCode,
        amount: resData.order.amount,
        status: resData.order.status,
        planName: resData.order.planName || 'Premium',
      },
      payment: {
        qrCodeUrl: resData.payment.qrCodeUrl,
        accountName: resData.payment.accountName,
        accountNumber: resData.payment.accountNumber,
        bankName: resData.payment.bankId || 'Ngân Hàng',
        transferContent: resData.payment.transferContent,
      },
    }
  },

  getOrderStatus: async (orderId: string): Promise<{ status: string; isPaid: boolean }> => {
    const response = await api.get<ApiResponse<BackendOrderResponse>>(`/orders/${encodeURIComponent(orderId)}`)
    const resData = response.data.data
    const status = (resData?.order?.status || 'PENDING').toUpperCase()
    const isPaid = status === 'PAID' || status === 'SUCCESS' || status === 'COMPLETED'
    return { status, isPaid }
  },

  cancelOrder: async (orderId: string): Promise<boolean> => {
    const response = await api.post<ApiResponse<unknown>>(`/orders/${encodeURIComponent(orderId)}/cancel`)
    return response.data.success
  },

  getPlans: async (): Promise<SubscriptionPackage[]> => {
    const response = await api.get<ApiResponse<PlanItem[]>>('/plans')
    const plans = Array.isArray(response.data.data) ? response.data.data : []

    return plans.map((plan) => ({
      id: plan._id,
      name: plan.name,
      price: plan.price,
      currency: 'VND',
      duration_months: Math.round((plan.durationDays || 30) / 30),
      features: plan.features || (plan.description ? [plan.description] : []),
      badge: plan.badge,
    }))
  },

  getPackages: async (): Promise<SubscriptionPackage[]> => {
    return subscriptionService.getPlans()
  },

  createPlan: async (planData: Partial<PlanItem>): Promise<PlanItem> => {
    const response = await api.post<ApiResponse<PlanItem>>('/plans', planData)
    return response.data.data
  },

  updatePlan: async (id: string, planData: Partial<PlanItem>): Promise<PlanItem> => {
    const response = await api.put<ApiResponse<PlanItem>>(`/plans/${encodeURIComponent(id)}`, planData)
    return response.data.data
  },

  deletePlan: async (id: string): Promise<boolean> => {
    const response = await api.delete<ApiResponse<unknown>>(`/plans/${encodeURIComponent(id)}`)
    return response.data.success
  },

  getCurrentSubscription: async (): Promise<UserSubscription> => {
    const response = await api.get<ApiResponse<BackendSubscriptionResponse>>('/subscriptions/current')
    const resData = response.data.data
    const sub = resData?.subscription

    const isPremium = resData?.isPremium ?? false
    let daysRemaining = 0
    if (sub?.endDate) {
      const diffMs = new Date(sub.endDate).getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    const planObj = typeof sub?.planId === 'object' && sub?.planId !== null ? sub.planId : null

    return {
      plan_id: planObj?._id || (typeof sub?.planId === 'string' ? sub.planId : 'free'),
      plan_name: planObj?.name || (isPremium ? 'Premium' : 'Gói Miễn Phí'),
      status: sub?.status || 'active',
      start_date: sub?.startDate || new Date().toISOString(),
      end_date: sub?.endDate || new Date().toISOString(),
      features: planObj?.features || (planObj?.description ? [planObj.description] : []),
      isPremium,
      daysRemaining,
    }
  },

  checkAiGrammarPermission: async (
    sentence: string,
  ): Promise<{ allowed: boolean; feedback?: string; reason?: string }> => {
    try {
      const response = await api.post<ApiResponse<{ correct: boolean; corrected: string; errors: string[] }>>('/ai/check-german-sentence', { sentence })
      const { correct, corrected, errors } = response.data.data
      let feedback = ''

      if (correct) {
        feedback = 'Tuyệt vời! Câu của bạn hoàn toàn chính xác.'
      } else {
        feedback = `Câu đúng: "${corrected}". ${errors?.length ? `Lỗi: ${errors.join(', ')}` : ''}`
      }

      return { allowed: true, feedback }
    } catch (err: unknown) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const errorObj = err as { response?: { status?: number } }
        if (errorObj.response?.status === 403) {
          return {
            allowed: false,
            reason: 'Tính năng AI Kiểm tra câu yêu cầu Gói Premium hoặc Pro.',
          }
        }
      }
      return {
        allowed: false,
        reason: 'Không thể kết nối đến AI service.',
      }
    }
  },
}
