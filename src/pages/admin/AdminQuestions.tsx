import { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminService } from '../../services/adminService'
import type {
  DifficultyType,
  LevelType,
  QuestionItem,
  QuestionOption,
  QuestionQuery,
  SkillType,
  StatusType,
} from '../../types/admin'

interface AdminQuestionsProps {
  autoOpenNewModal?: boolean
}

export const AdminQuestions = ({ autoOpenNewModal = false }: AdminQuestionsProps) => {
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filters, setFilters] = useState<QuestionQuery>({
    level: '',
    skill: '',
    difficulty: '',
    status: '',
    q: '',
    page: 1,
    limit: 10,
  })

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(autoOpenNewModal)
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [formData, setFormData] = useState<{
    level: LevelType
    topic: string
    type: string
    question: string
    options: QuestionOption[]
    explanation: string
    difficulty: DifficultyType
    skill: SkillType
    status: StatusType
  }>({
    level: 'A1',
    topic: 'Begrüßung',
    type: 'multiple_choice',
    question: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    explanation: '',
    difficulty: 'easy',
    skill: 'grammar',
    status: 'active',
  })

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      const data = await adminService.getQuestions(filters)
      setQuestions(data.questions)
      setPagination(data.pagination)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách câu hỏi.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  const handleOpenAddModal = () => {
    setEditingQuestion(null)
    setFormData({
      level: 'A1',
      topic: 'Begrüßung',
      type: 'multiple_choice',
      question: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
      explanation: '',
      difficulty: 'easy',
      skill: 'grammar',
      status: 'active',
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (q: QuestionItem) => {
    setEditingQuestion(q)
    setFormData({
      level: q.level,
      topic: q.topic,
      type: q.type || 'multiple_choice',
      question: q.question,
      options: q.options && q.options.length > 0 ? q.options : [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ],
      explanation: q.explanation || '',
      difficulty: q.difficulty,
      skill: q.skill,
      status: q.status,
    })
    setIsModalOpen(true)
  }

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        await adminService.updateQuestion(editingQuestion._id, formData)
      } else {
        await adminService.createQuestion(formData)
      }
      setIsModalOpen(false)
      fetchQuestions()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu câu hỏi.'
      alert(msg)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa (chuyển inactive) câu hỏi này?')) return
    try {
      await adminService.deleteQuestion(id)
      fetchQuestions()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa câu hỏi.'
      alert(msg)
    }
  }

  const handleOptionTextChange = (index: number, text: string) => {
    const newOptions = [...formData.options]
    newOptions[index].text = text
    setFormData({ ...formData, options: newOptions })
  }

  const handleOptionCorrectSelect = (index: number) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }))
    setFormData({ ...formData, options: newOptions })
  }

  const handleAddOptionRow = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', isCorrect: false }],
    })
  }

  return (
    <AdminLayout title="Quản Lý Ngân Hàng Câu Hỏi">
      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">❓ Danh Sách Câu Hỏi ({pagination.total})</h3>
          <button className="btn-admin-primary" onClick={handleOpenAddModal}>
            ➕ Thêm Câu Hỏi Mới
          </button>
        </div>

        {/* Filters Bar */}
        <div className="filter-bar">
          <input
            type="text"
            className="filter-input"
            placeholder="🔍 Tìm câu hỏi / từ khóa..."
            value={filters.q || ''}
            onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })}
          />

          <select
            className="filter-select"
            value={filters.level || ''}
            onChange={(e) => setFilters({ ...filters, level: e.target.value, page: 1 })}
          >
            <option value="">Tất cả Trình độ</option>
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
            <option value="C2">C2</option>
          </select>

          <select
            className="filter-select"
            value={filters.skill || ''}
            onChange={(e) => setFilters({ ...filters, skill: e.target.value, page: 1 })}
          >
            <option value="">Tất cả Kỹ năng</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="grammar">Grammar</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
          </select>

          <select
            className="filter-select"
            value={filters.difficulty || ''}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}
          >
            <option value="">Độ khó</option>
            <option value="easy">Dễ (Easy)</option>
            <option value="medium">Trung bình (Medium)</option>
            <option value="hard">Khó (Hard)</option>
          </select>

          <select
            className="filter-select"
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          >
            <option value="">Trạng thái</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Đang tải danh sách câu hỏi...</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cấp độ</th>
                  <th>Kỹ năng</th>
                  <th>Chủ đề</th>
                  <th>Nội dung câu hỏi</th>
                  <th>Độ khó</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {questions.length > 0 ? (
                  questions.map((q) => (
                    <tr key={q._id}>
                      <td>
                        <span className={`badge-pill badge-${q.level.toLowerCase()}`}>{q.level}</span>
                      </td>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{q.skill}</td>
                      <td style={{ color: '#475569' }}>{q.topic}</td>
                      <td style={{ fontWeight: 600, maxWidth: '300px' }}>{q.question}</td>
                      <td>
                        <span className={`badge-pill badge-${q.difficulty}`}>{q.difficulty}</span>
                      </td>
                      <td>
                        <span className={`badge-pill badge-${q.status}`}>{q.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button className="btn-admin-secondary" onClick={() => handleOpenEditModal(q)}>
                            Sửa
                          </button>
                          <button className="btn-admin-danger" onClick={() => handleDeleteQuestion(q._id)}>
                            Xóa (Soft)
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>
                      Không tìm thấy câu hỏi phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Question Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">{editingQuestion ? 'Chỉnh Sửa Câu Hỏi' : 'Thêm Mới Câu Hỏi'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cấp Độ (Level)</label>
                  <select
                    className="form-select"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as LevelType })}
                  >
                    <option value="A1">A1</option>
                    <option value="A2">A2</option>
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Kỹ Năng (Skill)</label>
                  <select
                    className="form-select"
                    value={formData.skill}
                    onChange={(e) => setFormData({ ...formData, skill: e.target.value as SkillType })}
                  >
                    <option value="grammar">Grammar</option>
                    <option value="vocabulary">Vocabulary</option>
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Độ Khó (Difficulty)</label>
                  <select
                    className="form-select"
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as DifficultyType })}
                  >
                    <option value="easy">Easy (Dễ)</option>
                    <option value="medium">Medium (Trung bình)</option>
                    <option value="hard">Hard (Khó)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Chủ Đề (Topic)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Begrüßung, Einkaufen..."
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Trạng Thái (Status)</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nội Dung Câu Hỏi</label>
                <textarea
                  className="form-textarea"
                  placeholder="Nhập nội dung câu hỏi tiếng Đức..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              {/* Options */}
              <div className="form-group">
                <label className="form-label">Danh Sách Lựa Chọn (Tích nút chọn đáp án ĐÚNG)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="option-row">
                    <input
                      type="radio"
                      name="correctOption"
                      className="option-radio"
                      checked={opt.isCorrect}
                      onChange={() => handleOptionCorrectSelect(idx)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Lựa chọn ${idx + 1}...`}
                      value={opt.text}
                      onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                      required
                    />
                    {opt.isCorrect && <span style={{ color: '#15803d', fontWeight: 700, fontSize: '0.85rem' }}>ĐÚNG</span>}
                  </div>
                ))}
                <button type="button" className="btn-admin-secondary" style={{ marginTop: '8px' }} onClick={handleAddOptionRow}>
                  ➕ Thêm Lựa Chọn
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Giải Thích Đáp Án (Explanation)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Giải thích chi tiết vì sao đáp án này đúng..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-admin-secondary" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-admin-primary">
                  {editingQuestion ? 'Cập Nhật' : 'Tạo Câu Hỏi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminQuestions
