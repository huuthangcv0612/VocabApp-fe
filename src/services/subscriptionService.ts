import api from './api'
import { vocabularyApi } from './vocabularyApi'
import type { ApiResponse } from '../types/api'
import type {
  UserSubscription,
  CreateOrderResponse,
} from '../types/gamification'

import type { Plan, PlanItem, PlansResponseData } from '../types/plan'

export type { Plan, PlanItem, PlansResponseData }

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

  getOrders: async (): Promise<BackendOrderResponse[]> => {
    const response = await api.get<ApiResponse<BackendOrderResponse[] | { orders: BackendOrderResponse[] }>>('/orders')
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'orders' in data && Array.isArray(data.orders)) {
      return data.orders
    }
    return []
  },

  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get<ApiResponse<PlansResponseData>>('/plans')
    const rawData = response.data?.data
    let plansList: Plan[] = []

    if (rawData && typeof rawData === 'object' && 'plans' in rawData && Array.isArray(rawData.plans)) {
      plansList = rawData.plans
    } else if (Array.isArray(rawData)) {
      plansList = rawData as Plan[]
    }

    return plansList.map((plan) => ({
      _id: plan._id,
      name: plan.name,
      code: plan.code,
      price: plan.price,
      durationDays: plan.durationDays ?? 0,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features : [],
      permissions: Array.isArray(plan.permissions) ? plan.permissions : [],
      planType: plan.planType,
      isActive: plan.isActive !== false,
      sortOrder: plan.sortOrder ?? 0,
      badge: plan.badge,
      id: plan._id,
      duration_months: plan.durationDays ? Math.round(plan.durationDays / 30) : 0,
    }))
  },

  getPlan: async (planId: string): Promise<PlanItem> => {
    const response = await api.get<ApiResponse<PlanItem | { plan: PlanItem }>>(`/plans/${encodeURIComponent(planId)}`)
    const data = response.data.data
    if (data && typeof data === 'object' && 'plan' in data) {
      return data.plan
    }
    return data as PlanItem
  },

  getPackages: async (): Promise<Plan[]> => {
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

    const planId = planObj?._id || (typeof sub?.planId === 'string' ? sub.planId : 'free')
    const planName = planObj?.name || (isPremium ? 'Premium' : 'Gói Miễn Phí')
    const rawRes = resData as unknown as Record<string, unknown>
    const isCustom =
      planId.toLowerCase().includes('custom') ||
      planName.toLowerCase().includes('custom') ||
      rawRes?.isCustom === true ||
      rawRes?.hasCustomPlan === true

    return {
      plan_id: planId,
      plan_name: planName,
      status: sub?.status || 'active',
      start_date: sub?.startDate || new Date().toISOString(),
      end_date: sub?.endDate || new Date().toISOString(),
      features: planObj?.features || (planObj?.description ? [planObj.description] : []),
      isPremium,
      isCustom,
      hasCustomPlan: isCustom,
      canManageClasses: isCustom,
      daysRemaining,
    }
  },

  getSubscriptionHistory: async (): Promise<BackendSubscriptionResponse[]> => {
    const response = await api.get<ApiResponse<BackendSubscriptionResponse[] | { subscriptions: BackendSubscriptionResponse[] }>>('/subscriptions/history')
    const data = response.data.data
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'subscriptions' in data && Array.isArray(data.subscriptions)) {
      return data.subscriptions
    }
    return []
  },

  checkAiGrammarPermission: async (
    sentence: string,
  ): Promise<{ allowed: boolean; feedback?: string; reason?: string }> => {
    try {
      const feedback = await vocabularyApi.getSentenceFeedback(sentence)
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
