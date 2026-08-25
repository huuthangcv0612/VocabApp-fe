import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { subscriptionService } from '../../services/subscriptionService'
import type { SubscriptionPackage } from '../../types/gamification'
import { toast } from 'react-hot-toast'

const DEFAULT_FEATURE_OPTIONS = [
  'Toàn bộ bài học',
  'Exercises',
  'Progress',
  'AI Grammar',
  'Phát âm giọng đọc chuẩn',
  'Không quảng cáo',
]

export const AdminPlans: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<SubscriptionPackage | null>(null)
  const [formData, setFormData] = useState<{
    id: string
    name: string
    price: number
    duration_days: number
    features: string[]
    customFeatureText: string
  }>({
    id: '',
    name: '',
    price: 10000,
    duration_days: 30,
    features: ['Toàn bộ bài học', 'Exercises', 'Progress'],
    customFeatureText: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete Dialog States
  const [deleteTarget, setDeleteTarget] = useState<SubscriptionPackage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await subscriptionService.getPlans()
      setPlans(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách Gói dịch vụ từ server.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      id: `plan_${Date.now()}`,
      name: '',
      price: 10000,
      duration_days: 30,
      features: ['Toàn bộ bài học', 'Exercises', 'Progress'],
      customFeatureText: '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: SubscriptionPackage) => {
    setEditingItem(item)
    const days = item.duration_months ? item.duration_months * 30 : 30
    setFormData({
      id: String(item.id),
      name: item.name,
      price: item.price,
      duration_days: days,
      features: item.features || [],
      customFeatureText: '',
    })
    setIsModalOpen(true)
  }

  const handleToggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature)
      if (exists) {
        return { ...prev, features: prev.features.filter((f) => f !== feature) }
      }
      return { ...prev, features: [...prev.features, feature] }
    })
  }

  const handleAddCustomFeature = () => {
    if (!formData.customFeatureText.trim()) return
    const text = formData.customFeatureText.trim()
    if (!formData.features.includes(text)) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, text],
        customFeatureText: '',
      }))
    } else {
      setFormData((prev) => ({ ...prev, customFeatureText: '' }))
    }
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên gói dịch vụ!')
      return
    }

    try {
      setIsSubmitting(true)
      const payload: Partial<SubscriptionPackage> = {
        id: formData.id || editingItem?.id || `plan_${Date.now()}`,
        name: formData.name,
        price: Number(formData.price || 0),
        duration_months: Math.ceil(formData.duration_days / 30),
        features: formData.features,
      }

      if (editingItem) {
        // Update via PUT /api/plans/:id
        await subscriptionService.updatePlan(String(editingItem.id), payload)
        setPlans((prev) =>
          prev.map((item) => (item.id === editingItem.id ? ({ ...item, ...payload } as SubscriptionPackage) : item))
        )
        toast.success(`Đã cập nhật gói ${formData.name}! Giá mới sẽ tự động cập nhật trên FE.`)
      } else {
        const created = await subscriptionService.createPlan(payload)
        const newItem: SubscriptionPackage = {
          id: created._id || `plan_${Date.now()}`,
          name: created.name || formData.name,
          price: created.price ?? formData.price,
          currency: 'VND',
          duration_months: Math.ceil(formData.duration_days / 30),
          features: formData.features,
        }
        setPlans((prev) => [...prev, newItem])
        toast.success(`Đã tạo gói mới ${formData.name}!`)
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại!'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await subscriptionService.deletePlan(String(deleteTarget.id))
      setPlans((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      toast.success(`Đã xóa gói ${deleteTarget.name}!`)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa gói!'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return '0đ'
    return `${price.toLocaleString('vi-VN')}đ`
  }

  return (
    <AdminLayout title="Quản Lý Gói Dịch Vụ (Subscription Plans)">
      {/* Top Action Bar */}
      <div
        className="admin-card"
        style={{
          padding: '20px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            💳 Subscription Plans
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
            Thay đổi giá & đặc quyền gói CMS. FE Pricing tự động cập nhật không cần re-deploy.
          </p>
        </div>

        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Plan Mới
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <AdminLoadingState message="Đang tải danh sách các gói dịch vụ..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchPlans} />
      ) : plans.length === 0 ? (
        <AdminEmptyState
          title="Chưa có gói dịch vụ nào"
          description="Hãy tạo gói dịch vụ đầu tiên (FREE, PREMIUM 1 THÁNG, ...) để học viên đăng ký."
          actionLabel="Tạo Plan Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card" style={{ padding: '24px', overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>TÊN GÓI</th>
                <th style={{ width: '18%' }}>GIÁ</th>
                <th style={{ width: '18%' }}>THỜI HẠN</th>
                <th style={{ width: '30%' }}>FEATURES (ĐẶC QUYỀN)</th>
                <th style={{ width: '12%', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((item) => {
                const days = item.duration_months ? item.duration_months * 30 : 30
                return (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.name}</strong>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: '#2a63e8',
                          fontSize: '1.1rem',
                        }}
                      >
                        {formatPrice(item.price)}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          backgroundColor: '#eef2ff',
                          color: '#4338ca',
                          padding: '4px 10px',
                          borderRadius: '999px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                        }}
                      >
                        {days} ngày
                      </span>
                    </td>

                    <td>
                      <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.88rem', color: '#334155' }}>
                        {item.features?.map((feat, idx) => (
                          <li key={idx}>☑ {feat}</li>
                        ))}
                      </ul>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          className="btn-admin-icon"
                          title="Sửa Gói"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-admin-icon danger"
                          title="Xóa Gói"
                          onClick={() => setDeleteTarget(item)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Create/Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? `Chỉnh Sửa Gói: ${editingItem.name}` : 'Tạo Gói Dịch Vụ Mới'}
      >
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
              Tên Gói: <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="admin-input"
              placeholder="VD: Premium 1 tháng"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
                Giá (VNĐ): <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                className="admin-input"
                placeholder="VD: 10000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <label style={{ fontWeight: 700, display: 'block', marginBottom: '6px', fontSize: '0.9rem' }}>
                Thời Hạn (Ngày): <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="1"
                className="admin-input"
                placeholder="VD: 30"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: Number(e.target.value) })}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>
              Features (Đặc Quyền Gói):
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              {DEFAULT_FEATURE_OPTIONS.map((feat) => {
                const checked = formData.features.includes(feat)
                return (
                  <label
                    key={feat}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleFeature(feat)}
                    />
                    <span>☑ {feat}</span>
                  </label>
                )
              })}
            </div>

            {/* Custom feature input */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="admin-input"
                placeholder="Thêm đặc quyền khác..."
                value={formData.customFeatureText}
                onChange={(e) => setFormData({ ...formData, customFeatureText: e.target.value })}
              />
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={handleAddCustomFeature}
                style={{ flexShrink: 0 }}
              >
                + Thêm
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button type="submit" className="btn-admin-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang Lưu...' : 'Save (Lưu Đổi Mới)'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác Nhận Xóa Gói Dịch Vụ"
        message={`Bạn có chắc chắn muốn xóa gói "${deleteTarget?.name}"?`}
        confirmText="Xóa Plan"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminPlans
