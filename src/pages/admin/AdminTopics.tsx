import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type { TopicItem, LevelItem, StatusType } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminTopics: React.FC = () => {
  const [topics, setTopics] = useState<TopicItem[]>([])
  const [levels, setLevels] = useState<LevelItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<TopicItem | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    slug: string
    description: string
    order: number
    status: StatusType
    level_id: string
  }>({
    name: '',
    slug: '',
    description: '',
    order: 1,
    status: 'active',
    level_id: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<TopicItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const levelIdParam = selectedLevelFilter === 'all' ? undefined : selectedLevelFilter
      const [topicList, levelList] = await Promise.all([
        adminService.getTopics(levelIdParam),
        adminService.getLevels(),
      ])
      
      // Fallback: if filtered API returned empty but level is set, try fetching all topics and filtering client-side
      let finalTopics = Array.isArray(topicList) ? topicList : []
      if (finalTopics.length === 0 && levelIdParam) {
        const allTopics = await adminService.getTopics().catch(() => [])
        if (Array.isArray(allTopics) && allTopics.length > 0) {
          finalTopics = allTopics
        }
      }

      setTopics(finalTopics)
      setLevels(Array.isArray(levelList) ? levelList : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách Chủ đề từ server.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedLevelFilter])

  const selectedLevelObj = levels.find(
    (l) => l._id === selectedLevelFilter || l.level_name === selectedLevelFilter
  )

  const filteredTopics = (Array.isArray(topics) ? topics : []).filter((t) => {
    const topicName = t.name || t.topic_name || ''
    const matchesSearch =
      !search.trim() ||
      topicName.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())

    if (selectedLevelFilter === 'all') return matchesSearch

    const tLevelId = typeof t.level_id === 'object' && t.level_id !== null ? t.level_id._id : t.level_id
    const tLevelName = typeof t.level_id === 'object' && t.level_id !== null ? t.level_id.level_name : undefined
    const tLevelObjId = typeof t.level === 'object' && t.level !== null ? (t.level as { _id?: string })._id : t.level
    const tLevelObjName = typeof t.level === 'object' && t.level !== null ? (t.level as { level_name?: string }).level_name : undefined

    const matchesLevel =
      tLevelId === selectedLevelFilter ||
      tLevelName === selectedLevelFilter ||
      tLevelObjId === selectedLevelFilter ||
      tLevelObjName === selectedLevelFilter ||
      (selectedLevelObj && (
        tLevelId === selectedLevelObj._id ||
        tLevelId === selectedLevelObj.level_name ||
        tLevelName === selectedLevelObj.level_name ||
        tLevelObjId === selectedLevelObj._id ||
        tLevelObjName === selectedLevelObj.level_name
      ))

    return matchesSearch && matchesLevel
  })

  const getLevelDisplayName = (topic: TopicItem) => {
    if (typeof topic.level_id === 'object' && topic.level_id?.level_name) {
      return topic.level_id.level_name
    }
    if (typeof topic.level === 'object' && topic.level && 'level_name' in topic.level) {
      return (topic.level as { level_name: string }).level_name
    }
    const targetId = typeof topic.level_id === 'string' ? topic.level_id : typeof topic.level === 'string' ? topic.level : ''
    const found = levels.find((l) => l._id === targetId || l.level_name === targetId)
    return found ? found.level_name : (targetId || 'N/A')
  }

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      order: topics.length + 1,
      status: 'active',
      level_id: levels.length > 0 ? levels[0]._id : '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (topic: TopicItem) => {
    setEditingItem(topic)
    const levelIdVal = typeof topic.level_id === 'object' ? topic.level_id._id : (topic.level_id || (typeof topic.level === 'object' ? topic.level._id : topic.level) || '')
    setFormData({
      name: topic.name || topic.topic_name || '',
      slug: topic.slug || '',
      description: topic.description || '',
      order: topic.order || 1,
      status: topic.status || 'active',
      level_id: String(levelIdVal),
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên chủ đề!')
      return
    }

    const payload = {
      name: formData.name,
      topic_name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      order: formData.order,
      status: formData.status,
      level_id: formData.level_id,
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        const updated = await adminService.updateTopic(editingItem._id, payload)
        setTopics((prev) =>
          prev.map((item) => (item._id === editingItem._id ? { ...item, ...updated, ...payload } : item)),
        )
        toast.success(`Đã cập nhật chủ đề "${formData.name}"!`)
      } else {
        const created = await adminService.createTopic(payload)
        const newItem: TopicItem = {
          _id: created._id || `top_${Date.now()}`,
          name: formData.name,
          topic_name: formData.name,
          slug: payload.slug,
          description: formData.description,
          order: formData.order,
          status: formData.status,
          level_id: formData.level_id,
        }
        setTopics((prev) => [...prev, newItem])
        toast.success(`Đã thêm chủ đề "${formData.name}" thành công!`)
      }
      setIsModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await adminService.deleteTopic(deleteTarget._id)
      setTopics((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(`Đã xóa chủ đề "${deleteTarget.name || deleteTarget.topic_name}"!`)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa chủ đề thất bại.'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout title="Quản Lý Chủ Đề (Topics)" breadcrumbs={[{ label: 'Topics' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Chủ Đề (Topic CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý chủ đề theo Trình độ, bao gồm slug, mô tả và trạng thái</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Chủ Đề Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm tên chủ đề hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedLevelFilter}
          onChange={(e) => setSelectedLevelFilter(e.target.value)}
        >
          <option value="all">Tất cả Trình Độ (Levels)</option>
          {levels.map((lvl) => (
            <option key={lvl._id} value={lvl._id}>
              {lvl.level_name}
            </option>
          ))}
        </select>
      </div>

      {/* Content States */}
      {loading ? (
        <AdminLoadingState message="Đang tải danh sách chủ đề..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchData} />
      ) : filteredTopics.length === 0 ? (
        <AdminEmptyState
          icon="🏷️"
          title="Chưa có chủ đề nào"
          description="Thử thay đổi bộ lọc trình độ hoặc tạo chủ đề mới."
          actionLabel="Thêm Chủ Đề Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tên Chủ Đề (Topic)</th>
                  <th>Slug</th>
                  <th>Thuộc Trình Độ (Level)</th>
                  <th>Mô Tả</th>
                  <th>Thứ Tự</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopics.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontWeight: 700 }}>{t.name || t.topic_name}</td>
                    <td style={{ color: '#64748b', fontFamily: 'monospace' }}>{t.slug || '-'}</td>
                    <td>
                      <span className="badge-pill badge-a1">{getLevelDisplayName(t)}</span>
                    </td>
                    <td style={{ color: '#475569', maxWidth: '260px' }}>{t.description || '-'}</td>
                    <td>#{t.order || 1}</td>
                    <td>
                      <span className={`badge-pill ${t.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {t.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(t)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteTarget(t)}>
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
        title={editingItem ? `Sửa Chủ Đề: ${editingItem.name || editingItem.topic_name}` : 'Thêm Chủ Đề Mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Chọn Trình Độ (Level) *</label>
            <select
              className="form-select"
              value={formData.level_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, level_id: e.target.value }))}
              required
            >
              <option value="" disabled>-- Select Level --</option>
              {levels.map((lvl) => (
                <option key={lvl._id} value={lvl._id}>
                  {lvl.level_name} - {lvl.description}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tên Chủ Đề (name) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: Chào hỏi, Mua sắm, Du lịch..."
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tự động tạo từ tên nếu để trống (ví dụ: chao-hoi)"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả nội dung học của chủ đề..."
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Thứ Tự (order)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={formData.order}
                onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
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
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Chủ Đề'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Chủ đề"
        message="Bạn có chắc chắn muốn xóa chủ đề này?"
        itemName={deleteTarget ? deleteTarget.name || deleteTarget.topic_name : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminTopics
