import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type { LevelItem } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminLevels: React.FC = () => {
  const [levels, setLevels] = useState<LevelItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LevelItem | null>(null)
  const [formData, setFormData] = useState<{ level_name: string; description: string; order: number }>({
    level_name: '',
    description: '',
    order: 1,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete dialog states
  const [deleteTarget, setDeleteTarget] = useState<LevelItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchLevels = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getLevels()
      setLevels(Array.isArray(data) ? data : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách Trình độ từ server.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLevels()
  }, [])

  const safeLevels = Array.isArray(levels) ? levels : []

  const filteredLevels = safeLevels.filter((lvl) => {
    const name = lvl.level_name || lvl.name || ''
    const desc = lvl.description || ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      desc.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      level_name: '',
      description: '',
      order: levels.length + 1,
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: LevelItem) => {
    setEditingItem(item)
    setFormData({
      level_name: item.level_name || '',
      description: item.description || '',
      order: item.order || 1,
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.level_name.trim()) {
      toast.error('Vui lòng nhập tên trình độ!')
      return
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        // Update
        const updated = await adminService.updateLevel(editingItem._id, formData)
        setLevels((prev) =>
          prev.map((item) => (item._id === editingItem._id ? { ...item, ...updated, ...formData } : item)),
        )
        toast.success(`Đã cập nhật trình độ ${formData.level_name}!`)
      } else {
        // Create
        const created = await adminService.createLevel(formData)
        const newItem: LevelItem = {
          _id: created._id || `lvl_${Date.now()}`,
          level_name: formData.level_name,
          description: formData.description,
          order: formData.order,
        }
        setLevels((prev) => [...prev, newItem])
        toast.success(`Đã thêm trình độ ${formData.level_name} thành công!`)
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại, vui lòng thử lại.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await adminService.deleteLevel(deleteTarget._id)
      setLevels((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(`Đã xóa trình độ ${deleteTarget.level_name}!`)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa trình độ thất bại.'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout title="Quản Lý Trình Độ (Levels)" breadcrumbs={[{ label: 'Levels' }]}>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Trình Độ (Level CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý tên trình độ CEFR (A1, A2, B1...), mô tả và thứ tự sắp xếp</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Trình Độ Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm theo tên trình độ hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content States */}
      {loading ? (
        <AdminLoadingState message="Đang tải dữ liệu Trình độ từ máy chủ..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchLevels} />
      ) : filteredLevels.length === 0 ? (
        <AdminEmptyState
          icon="📶"
          title="Chưa có trình độ nào"
          description="Bắt đầu tạo trình độ đầu tiên để làm nền tảng cho Topics và Lessons."
          actionLabel="Thêm Trình Độ Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Mã / Tên Level</th>
                  <th>Mô Tả</th>
                  <th>Thứ Tự (Order)</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLevels.map((lvl) => (
                  <tr key={lvl._id}>
                    <td>
                      <span className="badge-pill badge-a1">{lvl.level_name || lvl.name || 'Level'}</span>
                    </td>
                    <td style={{ color: '#334155', maxWidth: '360px' }}>{lvl.description || 'Chưa có mô tả'}</td>
                    <td>
                      <strong>#{lvl.order}</strong>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(lvl)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteTarget(lvl)}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? `Chỉnh Sửa Trình Độ: ${editingItem.level_name}` : 'Thêm Trình Độ Mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Tên Trình Độ (level_name) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: A1, A2, B1, B2..."
              value={formData.level_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, level_name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả (description)</label>
            <textarea
              className="form-textarea"
              placeholder="Nhập mô tả chi tiết cho trình độ này..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thứ Tự Sắp Xếp (order)</label>
            <input
              type="number"
              className="form-input"
              min={1}
              value={formData.order}
              onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-admin-secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button type="submit" className="btn-admin-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Trình Độ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Trình độ"
        message="Bạn có chắc chắn muốn xóa trình độ này khỏi cơ sở dữ liệu?"
        itemName={deleteTarget ? deleteTarget.level_name : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminLevels
