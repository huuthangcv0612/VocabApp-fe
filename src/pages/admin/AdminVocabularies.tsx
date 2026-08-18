import React, { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import Pagination from '../../components/admin/Pagination'
import { adminService } from '../../services/adminService'
import type { VocabularyAdminItem, LessonItem, PaginationMeta } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminVocabularies: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<VocabularyAdminItem[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  })

  // Filters
  const [search, setSearch] = useState('')
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('all')
  const [selectedPosFilter, setSelectedPosFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // View detail modal
  const [viewingItem, setViewingItem] = useState<VocabularyAdminItem | null>(null)

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<VocabularyAdminItem | null>(null)
  const [formData, setFormData] = useState<{
    word: string
    meaning: string
    pronunciation: string
    part_of_speech: string
    example: string
    example_translation: string
    audio_url: string
    image_url: string
    level: string
    tags: string
    lektionId: string
  }>({
    word: '',
    meaning: '',
    pronunciation: '',
    part_of_speech: 'noun',
    example: '',
    example_translation: '',
    audio_url: '',
    image_url: '',
    level: 'A1',
    tags: '',
    lektionId: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete states
  const [deleteTarget, setDeleteTarget] = useState<VocabularyAdminItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchVocabularies = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const [vocabRes, lessonList] = await Promise.all([
        adminService.getVocabularies({
          q: search,
          level: selectedLevelFilter !== 'all' ? selectedLevelFilter : undefined,
          page,
          limit: 10,
        }),
        adminService.getLessons(),
      ])
      setVocabularies(vocabRes.vocabularies)
      setPagination(vocabRes.pagination)
      setLessons(lessonList)
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách từ vựng từ server.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVocabularies(1)
  }, [selectedLevelFilter])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchVocabularies(1)
  }

  const filteredVocabularies = vocabularies.filter((v) => {
    if (selectedPosFilter === 'all') return true
    const pos = (v.part_of_speech || '').toLowerCase()
    return pos === selectedPosFilter.toLowerCase()
  })

  const getLessonTitle = (item: VocabularyAdminItem) => {
    if (typeof item.lektionId === 'object' && item.lektionId !== null) {
      const lekObj = item.lektionId as LessonItem
      return lekObj.title || lekObj.lektion_name || '-'
    }
    const found = lessons.find((l) => l._id === item.lektionId)
    return found ? found.title || found.lektion_name : '-'
  }

  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setFormData({
      word: '',
      meaning: '',
      pronunciation: '',
      part_of_speech: 'noun',
      example: '',
      example_translation: '',
      audio_url: '',
      image_url: '',
      level: 'A1',
      tags: '',
      lektionId: lessons.length > 0 ? lessons[0]._id : '',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: VocabularyAdminItem) => {
    setEditingItem(item)
    const lekId = typeof item.lektionId === 'object' && item.lektionId !== null ? (item.lektionId as LessonItem)._id : String(item.lektionId || '')
    setFormData({
      word: item.word || '',
      meaning: item.meaning || '',
      pronunciation: item.pronunciation || '',
      part_of_speech: item.part_of_speech || 'noun',
      example: item.example || '',
      example_translation: item.example_translation || '',
      audio_url: item.audio_url || '',
      image_url: item.image_url || '',
      level: item.level || 'A1',
      tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
      lektionId: String(lekId),
    })
    setIsModalOpen(true)
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.word.trim()) {
      toast.error('Vui lòng nhập Từ tiếng Đức!')
      return
    }
    if (!formData.meaning.trim()) {
      toast.error('Vui lòng nhập Nghĩa tiếng Việt!')
      return
    }

    const payload: Partial<VocabularyAdminItem> = {
      word: formData.word,
      meaning: formData.meaning,
      pronunciation: formData.pronunciation,
      part_of_speech: formData.part_of_speech,
      example: formData.example,
      example_translation: formData.example_translation,
      audio_url: formData.audio_url,
      image_url: formData.image_url,
      level: formData.level,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      lektionId: formData.lektionId || undefined,
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        const updated = await adminService.updateVocabulary(editingItem._id, payload)
        setVocabularies((prev) =>
          prev.map((v) => (v._id === editingItem._id ? { ...v, ...updated, ...payload } : v)),
        )
        toast.success(`Đã cập nhật từ vựng "${formData.word}"!`)
      } else {
        const created = await adminService.createVocabulary(payload)
        const newItem: VocabularyAdminItem = {
          _id: created._id || `v_${Date.now()}`,
          ...payload,
        } as VocabularyAdminItem
        setVocabularies((prev) => [newItem, ...prev])
        toast.success(`Đã thêm từ vựng "${formData.word}" thành công!`)
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
      await adminService.deleteVocabulary(deleteTarget._id)
      setVocabularies((prev) => prev.filter((v) => v._id !== deleteTarget._id))
      toast.success(`Đã xóa từ vựng "${deleteTarget.word}"!`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Xóa từ vựng thất bại.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AdminLayout title="Quản Lý Từ Vựng (Vocabulary CMS)" breadcrumbs={[{ label: 'Vocabulary' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Quản Lý Từ Vựng (Vocabulary CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý kho từ vựng tiếng Đức, phát âm, ví dụ, audio & hình ảnh</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Thêm Từ Vựng Mới
        </button>
      </div>

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearchSubmit} className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm từ tiếng Đức hoặc nghĩa tiếng Việt (Bấm Enter)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedLevelFilter}
          onChange={(e) => setSelectedLevelFilter(e.target.value)}
        >
          <option value="all">Tất cả Trình Độ</option>
          <option value="A1">Level A1</option>
          <option value="A2">Level A2</option>
          <option value="B1">Level B1</option>
          <option value="B2">Level B2</option>
          <option value="C1">Level C1</option>
          <option value="C2">Level C2</option>
        </select>

        <select
          className="filter-select"
          value={selectedPosFilter}
          onChange={(e) => setSelectedPosFilter(e.target.value)}
        >
          <option value="all">Tất cả Loại Từ (Part of speech)</option>
          <option value="noun">Danh từ (noun)</option>
          <option value="verb">Động từ (verb)</option>
          <option value="adjective">Tính từ (adjective)</option>
          <option value="adverb">Phó từ (adverb)</option>
          <option value="other">Cụm từ / Khác (other)</option>
        </select>

        <button type="submit" className="btn-admin-secondary">
          🔍 Tìm kiếm
        </button>
      </form>

      {/* Content States */}
      {loading ? (
        <AdminLoadingState message="Đang tải danh sách từ vựng..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => fetchVocabularies(pagination.page)} />
      ) : filteredVocabularies.length === 0 ? (
        <AdminEmptyState
          icon="📚"
          title="Không tìm thấy từ vựng nào"
          description="Thử đổi từ khóa hoặc bộ lọc trình độ/loại từ."
          actionLabel="Thêm Từ Vựng Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card" style={{ paddingBottom: 0 }}>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Từ Tiếng Đức (Word)</th>
                  <th>Phát Âm</th>
                  <th>Loại Từ</th>
                  <th>Nghĩa Tiếng Việt</th>
                  <th>Ví Dụ</th>
                  <th>Trình Độ</th>
                  <th>Bài Học (Lesson)</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredVocabularies.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{v.word}</strong>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.85rem' }}>{v.pronunciation || '-'}</td>
                    <td>
                      <span className="badge-pill badge-a1">{v.part_of_speech || 'noun'}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{v.meaning}</td>
                    <td style={{ fontSize: '0.83rem', maxWidth: '220px' }}>
                      {v.example ? <span>• {v.example}</span> : <span style={{ color: '#cbd5e1' }}>-</span>}
                    </td>
                    <td>
                      <span className={`badge-pill badge-${(v.level || 'a1').toLowerCase()}`}>
                        {v.level || 'A1'}
                      </span>
                    </td>
                    <td style={{ color: '#475569', fontSize: '0.85rem' }}>{getLessonTitle(v)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-admin-secondary"
                          title="Xem chi tiết"
                          onClick={() => setViewingItem(v)}
                        >
                          👁️ View
                        </button>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(v)}>
                          ✏️ Sửa
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteTarget(v)}>
                          🗑️ Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) => fetchVocabularies(page)}
          />
        </div>
      )}

      {/* View Detail Modal */}
      {viewingItem && (
        <Modal isOpen={Boolean(viewingItem)} title={`Chi Tiết Từ Vựng: ${viewingItem.word}`} onClose={() => setViewingItem(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.95rem' }}>
            <div><strong>Từ Tiếng Đức:</strong> <span style={{ fontSize: '1.2rem', color: '#2a63e8', fontWeight: 800 }}>{viewingItem.word}</span></div>
            <div><strong>Phiên âm:</strong> {viewingItem.pronunciation || 'Không có'}</div>
            <div><strong>Loại từ:</strong> <span className="badge-pill badge-a1">{viewingItem.part_of_speech || 'noun'}</span></div>
            <div><strong>Nghĩa tiếng Việt:</strong> {viewingItem.meaning}</div>
            <div><strong>Ví dụ tiếng Đức:</strong> {viewingItem.example || 'Không có'}</div>
            <div><strong>Dịch ví dụ:</strong> {viewingItem.example_translation || 'Không có'}</div>
            <div><strong>Trình độ:</strong> <span className="badge-pill badge-a1">{viewingItem.level || 'A1'}</span></div>
            {viewingItem.audio_url && <div><strong>Audio URL:</strong> <a href={viewingItem.audio_url} target="_blank" rel="noreferrer">{viewingItem.audio_url}</a></div>}
            {viewingItem.image_url && <div><strong>Hình ảnh:</strong> <br/><img src={viewingItem.image_url} alt={viewingItem.word} style={{ maxHeight: '120px', borderRadius: '8px', marginTop: '6px' }} /></div>}
            {viewingItem.tags && viewingItem.tags.length > 0 && <div><strong>Tags:</strong> {viewingItem.tags.join(', ')}</div>}
          </div>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn-admin-secondary" onClick={() => setViewingItem(null)}>Đóng</button>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal Form */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? `Chỉnh Sửa Từ Vựng: ${editingItem.word}` : 'Thêm Từ Vựng Mới'}
        onClose={() => setIsModalOpen(false)}
        maxWidth="720px"
      >
        <form onSubmit={handleSubmitForm}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Từ Tiếng Đức (word) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Apfel, kommen, schön..."
                value={formData.word}
                onChange={(e) => setFormData((prev) => ({ ...prev, word: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phiên Âm (pronunciation)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: [ˈapfl̩]"
                value={formData.pronunciation}
                onChange={(e) => setFormData((prev) => ({ ...prev, pronunciation: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nghĩa Tiếng Việt (meaning) *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Quả táo"
                value={formData.meaning}
                onChange={(e) => setFormData((prev) => ({ ...prev, meaning: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loại Từ (part_of_speech)</label>
              <select
                className="form-select"
                value={formData.part_of_speech}
                onChange={(e) => setFormData((prev) => ({ ...prev, part_of_speech: e.target.value }))}
              >
                <option value="noun">Danh từ (noun)</option>
                <option value="verb">Động từ (verb)</option>
                <option value="adjective">Tính từ (adjective)</option>
                <option value="adverb">Phó từ (adverb)</option>
                <option value="phrase">Cụm từ (phrase)</option>
                <option value="other">Khác (other)</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Ví Dụ Tiếng Đức (example)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Der Apfel ist rot."
                value={formData.example}
                onChange={(e) => setFormData((prev) => ({ ...prev, example: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dịch Ví Dụ (example_translation)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ví dụ: Quả táo màu đỏ."
                value={formData.example_translation}
                onChange={(e) => setFormData((prev) => ({ ...prev, example_translation: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Trình Độ (level)</label>
              <select
                className="form-select"
                value={formData.level}
                onChange={(e) => setFormData((prev) => ({ ...prev, level: e.target.value }))}
              >
                <option value="A1">Level A1</option>
                <option value="A2">Level A2</option>
                <option value="B1">Level B1</option>
                <option value="B2">Level B2</option>
                <option value="C1">Level C1</option>
                <option value="C2">Level C2</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Thuộc Bài Học (lektionId)</label>
              <select
                className="form-select"
                value={formData.lektionId}
                onChange={(e) => setFormData((prev) => ({ ...prev, lektionId: e.target.value }))}
              >
                <option value="">-- Không chọn bài học --</option>
                {lessons.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.title || l.lektion_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Audio URL (audio_url)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={formData.audio_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, audio_url: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL (image_url)</label>
              <input
                type="text"
                className="form-input"
                placeholder="https://..."
                value={formData.image_url}
                onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Thẻ Phân Loại (tags)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nhập các nhãn phân cách bằng dấu phẩy: obst, essen, a1..."
              value={formData.tags}
              onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
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
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Từ Vựng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Từ vựng"
        message="Bạn có chắc chắn muốn xóa từ vựng này khỏi cơ sở dữ liệu?"
        itemName={deleteTarget ? `${deleteTarget.word} (${deleteTarget.meaning})` : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminVocabularies
