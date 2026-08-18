import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type { UnitItem, TopicItem, StatusType } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminUnits: React.FC = () => {
  const [units, setUnits] = useState<UnitItem[]>([])
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UnitItem | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    unit_number: number
    description: string
    status: StatusType
    topic_id: string
  }>({
    name: '',
    unit_number: 1,
    description: '',
    status: 'active',
    topic_id: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<UnitItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [unitList, topicList] = await Promise.all([
        adminService.getUnits(),
        adminService.getTopics(),
      ])
      setUnits(unitList)
      setTopics(topicList)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách Units từ server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredUnits = units.filter((u) => {
    const unitName = u.name || u.unit_name || ''
    const matchesSearch =
      unitName.toLowerCase().includes(search.toLowerCase()) ||
      (u.description || '').toLowerCase().includes(search.toLowerCase())

    const topicObj = typeof u.topic_id === 'object' ? u.topic_id : typeof u.topic === 'object' ? u.topic : null
    const topicIdStr = topicObj ? topicObj._id : String(u.topic_id || u.topic || '')
    const matchesTopic = selectedTopicFilter === 'all' || topicIdStr === selectedTopicFilter

    return matchesSearch && matchesTopic
  })

  const getTopicDisplayName = (unit: UnitItem) => {
    if (typeof unit.topic_id === 'object' && (unit.topic_id?.name || unit.topic_id?.topic_name)) {
      return unit.topic_id.name || unit.topic_id.topic_name
    }
    if (typeof unit.topic === 'object' && (unit.topic?.name || unit.topic?.topic_name)) {
      return unit.topic.name || unit.topic.topic_name
    }
    const found = topics.find((t) => t._id === unit.topic_id || t._id === unit.topic)
    return found ? found.name || found.topic_name : 'N/A'
  }

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      unit_number: units.length + 1,
      description: '',
      status: 'active',
      topic_id: topics.length > 0 ? topics[0]._id : '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (unit: UnitItem) => {
    setEditingItem(unit)
    const topicIdVal = typeof unit.topic_id === 'object' ? unit.topic_id._id : (unit.topic_id || (typeof unit.topic === 'object' ? unit.topic._id : unit.topic) || '')
    setFormData({
      name: unit.name || unit.unit_name || '',
      unit_number: unit.unit_number || unit.order || 1,
      description: unit.description || '',
      status: unit.status || 'active',
      topic_id: String(topicIdVal),
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên Unit!')
      return
    }
    if (!formData.topic_id) {
      toast.error('Vui lòng chọn Chủ đề (Topic) cho Unit!')
      return
    }

    const payload = {
      name: formData.name,
      unit_name: formData.name,
      unit_number: formData.unit_number,
      order: formData.unit_number,
      description: formData.description,
      status: formData.status,
      topic_id: formData.topic_id,
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        const updated = await adminService.updateUnit(editingItem._id, payload)
        setUnits((prev) =>
          prev.map((item) => (item._id === editingItem._id ? { ...item, ...updated, ...payload } : item)),
        )
        toast.success(`Đã cập nhật Unit "${formData.name}"!`)
      } else {
        const created = await adminService.createUnit(payload)
        const newItem: UnitItem = {
          _id: created._id || `unit_${Date.now()}`,
          name: formData.name,
          unit_name: formData.name,
          unit_number: formData.unit_number,
          order: formData.unit_number,
          description: formData.description,
          status: formData.status,
          topic_id: formData.topic_id,
        }
        setUnits((prev) => [...prev, newItem])
        toast.success(`Đã thêm Unit "${formData.name}" thành công!`)
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Thao tác thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await adminService.deleteUnit(deleteTarget._id)
      setUnits((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(`Đã xóa Unit "${deleteTarget.name || deleteTarget.unit_name}"!`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Xóa Unit thất bại.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout title="Quản Lý Đơn Vị Học (Units)" breadcrumbs={[{ label: 'Units' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Đơn Vị Học (Unit CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý các Unit thuộc Topic, thứ tự bài học và mô tả</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Unit Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm tên Unit hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedTopicFilter}
          onChange={(e) => setSelectedTopicFilter(e.target.value)}
        >
          <option value="all">Tất cả Chủ Đề (Topics)</option>
          {topics.map((top) => (
            <option key={top._id} value={top._id}>
              {top.name || top.topic_name}
            </option>
          ))}
        </select>
      </div>

      {/* Content States */}
      {loading ? (
        <AdminLoadingState message="Đang tải danh sách Units..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchData} />
      ) : filteredUnits.length === 0 ? (
        <AdminEmptyState
          icon="📦"
          title="Chưa có Unit nào"
          description="Thử chọn chủ đề khác hoặc tạo Unit mới."
          actionLabel="Thêm Unit Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên Unit</th>
                  <th>Số Unit (Number)</th>
                  <th>Thuộc Chủ Đề (Topic)</th>
                  <th>Mô Tả</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 700 }}>{u.name || u.unit_name}</td>
                    <td>
                      <span className="badge-pill badge-a1">Unit {u.unit_number || u.order || 1}</span>
                    </td>
                    <td style={{ color: '#2a63e8', fontWeight: 600 }}>{getTopicDisplayName(u)}</td>
                    <td style={{ color: '#475569', maxWidth: '280px' }}>{u.description || '-'}</td>
                    <td>
                      <span className={`badge-pill ${u.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(u)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteTarget(u)}>
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? `Sửa Unit: ${editingItem.name || editingItem.unit_name}` : 'Thêm Unit Mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Chọn Chủ Đề (Topic) *</label>
            <select
              className="form-select"
              value={formData.topic_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, topic_id: e.target.value }))}
              required
            >
              <option value="" disabled>-- Select Topic --</option>
              {topics.map((top) => (
                <option key={top._id} value={top._id}>
                  {top.name || top.topic_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tên Unit (name) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: Unit 1: Begrüßung, Unit 2: Familie..."
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số Unit (unit_number / order)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={formData.unit_number}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit_number: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng Thái (status)</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))}
              >
                <option value="active">Active (Hoạt động)</option>
                <option value="draft">Draft (Bản nháp)</option>
                <option value="inactive">Inactive (Tắt)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả tóm tắt nội dung Unit..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Unit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Unit"
        message="Bạn có chắc chắn muốn xóa Unit này?"
        itemName={deleteTarget ? deleteTarget.name || deleteTarget.unit_name : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminUnits
