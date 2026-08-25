import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type { LessonItem, UnitItem, StatusType } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminLessons: React.FC = () => {
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [units, setUnits] = useState<UnitItem[]>([])
  const [search, setSearch] = useState('')
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LessonItem | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    slug: string
    description: string
    order: number
    status: StatusType
    estimated_minutes: number
    xp: number
    unit_id: string
  }>({
    title: '',
    slug: '',
    description: '',
    order: 1,
    status: 'active',
    estimated_minutes: 15,
    xp: 20,
    unit_id: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<LessonItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [lessonList, unitList] = await Promise.all([
        adminService.getLessons(),
        adminService.getUnits(),
      ])
      setLessons(lessonList)
      setUnits(unitList)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredLessons = lessons.filter((les) => {
    const lesTitle = les.title || les.lektion_name || ''
    const matchesSearch =
      lesTitle.toLowerCase().includes(search.toLowerCase()) ||
      (les.description || '').toLowerCase().includes(search.toLowerCase())

    const unitObj = typeof les.unit_id === 'object' ? les.unit_id : typeof les.unit === 'object' ? les.unit : null
    const unitIdStr = unitObj ? unitObj._id : String(les.unit_id || les.unit || '')
    const matchesUnit = selectedUnitFilter === 'all' || unitIdStr === selectedUnitFilter

    return matchesSearch && matchesUnit
  })

  const getUnitDisplayName = (lesson: LessonItem) => {
    if (typeof lesson.unit_id === 'object' && (lesson.unit_id?.name || lesson.unit_id?.unit_name)) {
      return lesson.unit_id.name || lesson.unit_id.unit_name
    }
    if (typeof lesson.unit === 'object' && (lesson.unit?.name || lesson.unit?.unit_name)) {
      return lesson.unit.name || lesson.unit.unit_name
    }
    const found = units.find((u) => u._id === lesson.unit_id || u._id === lesson.unit)
    return found ? found.name || found.unit_name : 'N/A'
  }

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      title: '',
      slug: '',
      description: '',
      order: lessons.length + 1,
      status: 'active',
      estimated_minutes: 15,
      xp: 20,
      unit_id: units.length > 0 ? units[0]._id : '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (lesson: LessonItem) => {
    setEditingItem(lesson)
    const unitIdVal = typeof lesson.unit_id === 'object' ? lesson.unit_id._id : (lesson.unit_id || (typeof lesson.unit === 'object' ? lesson.unit._id : lesson.unit) || '')
    setFormData({
      title: lesson.title || lesson.lektion_name || '',
      slug: lesson.slug || '',
      description: lesson.description || '',
      order: lesson.order || 1,
      status: lesson.status || 'active',
      estimated_minutes: lesson.estimated_minutes || 15,
      xp: lesson.xp || 20,
      unit_id: String(unitIdVal),
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học!')
      return
    }
    if (!formData.unit_id) {
      toast.error('Vui lòng chọn Unit cho bài học!')
      return
    }

    const payload = {
      title: formData.title,
      lektion_name: formData.title,
      slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description,
      order: formData.order,
      status: formData.status,
      estimated_minutes: formData.estimated_minutes,
      xp: formData.xp,
      unit_id: formData.unit_id,
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        const updated = await adminService.updateLesson(editingItem._id, payload)
        setLessons((prev) =>
          prev.map((item) => (item._id === editingItem._id ? { ...item, ...updated, ...payload } : item)),
        )
        toast.success(`Đã cập nhật bài học "${formData.title}"!`)
      } else {
        const created = await adminService.createLesson(payload)
        const newItem: LessonItem = {
          _id: created._id || `les_${Date.now()}`,
          title: formData.title,
          lektion_name: formData.title,
          slug: payload.slug,
          description: formData.description,
          order: formData.order,
          status: formData.status,
          estimated_minutes: formData.estimated_minutes,
          xp: formData.xp,
          unit_id: formData.unit_id,
        }
        setLessons((prev) => [...prev, newItem])
        toast.success(`Đã thêm bài học "${formData.title}" thành công!`)
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
      await adminService.deleteLesson(deleteTarget._id)
      setLessons((prev) => prev.filter((item) => item._id !== deleteTarget._id))
      toast.success(`Đã xóa bài học "${deleteTarget.title || deleteTarget.lektion_name}"!`)
      setDeleteTarget(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa bài học thất bại.'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout title="Quản Lý Bài Học (Lessons)" breadcrumbs={[{ label: 'Lessons' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Bài Học (Lesson CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý các Lektionen thuộc Unit, thời lượng dự kiến và điểm thưởng XP</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Bài Học Mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm tiêu đề bài học hoặc mô tả..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedUnitFilter}
          onChange={(e) => setSelectedUnitFilter(e.target.value)}
        >
          <option value="all">Tất cả Unit</option>
          {units.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name || u.unit_name}
            </option>
          ))}
        </select>
      </div>

      {/* Content States */}
      {loading ? (
        <AdminLoadingState message="Đang tải danh sách bài học..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchData} />
      ) : filteredLessons.length === 0 ? (
        <AdminEmptyState
          icon="📖"
          title="Chưa có bài học nào"
          description="Thử chọn Unit khác hoặc tạo bài học mới."
          actionLabel="Thêm Bài Học Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu Đề Bài Học</th>
                  <th>Thuộc Unit</th>
                  <th>Thời Lượng (Phút)</th>
                  <th>Điểm XP</th>
                  <th>Thứ Tự</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredLessons.map((les) => (
                  <tr key={les._id}>
                    <td style={{ fontWeight: 700 }}>{les.title || les.lektion_name}</td>
                    <td>
                      <span className="badge-pill badge-a1">{getUnitDisplayName(les)}</span>
                    </td>
                    <td>⏱️ {les.estimated_minutes || 15} phút</td>
                    <td>⚡ {les.xp || 20} XP</td>
                    <td>#{les.order || 1}</td>
                    <td>
                      <span className={`badge-pill ${les.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {les.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn-admin-primary"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => navigate(`/admin/lessons/${les._id}`)}
                          title="Mở màn hình quản lý nội dung Lesson Builder"
                        >
                          ⚙️ Builder
                        </button>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(les)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteTarget(les)}>
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
        title={editingItem ? `Sửa Bài Học: ${editingItem.title || editingItem.lektion_name}` : 'Thêm Bài Học Mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-group">
            <label className="form-label">Chọn Unit *</label>
            <select
              className="form-select"
              value={formData.unit_id}
              onChange={(e) => setFormData((prev) => ({ ...prev, unit_id: e.target.value }))}
              required
            >
              <option value="" disabled>-- Select Unit --</option>
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tiêu Đề Bài Học (title) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ví dụ: Begrüßungen am Tag, Lời chào trong ngày..."
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Slug</label>
            <input
              type="text"
              className="form-input"
              placeholder="Tự động tạo từ tiêu đề nếu trống..."
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Thời Lượng (phút)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={formData.estimated_minutes}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimated_minutes: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Điểm Thưởng (XP)</label>
              <input
                type="number"
                className="form-input"
                min={0}
                value={formData.xp}
                onChange={(e) => setFormData((prev) => ({ ...prev, xp: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="form-row">
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
            <label className="form-label">Mô Tả Bài Học</label>
            <textarea
              className="form-textarea"
              placeholder="Mô tả mục tiêu bài học..."
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
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Bài Học'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Bài học"
        message="Bạn có chắc chắn muốn xóa bài học này khỏi cơ sở dữ liệu?"
        itemName={deleteTarget ? deleteTarget.title || deleteTarget.lektion_name : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminLessons
