import React, { useEffect, useState, useCallback } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type { LessonExercise, LessonItem, StatusType, ExerciseType } from '../../types/admin'
import { toast } from 'react-hot-toast'

export const AdminExercises: React.FC = () => {
  const [exercises, setExercises] = useState<LessonExercise[]>([])
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LessonExercise | null>(null)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [exerciseType, setExerciseType] = useState<ExerciseType>('multiple_choice')
  const [question, setQuestion] = useState('')
  const [xp, setXp] = useState<number>(5)
  const [status, setStatus] = useState<StatusType>('active')
  const [explanation, setExplanation] = useState('')

  // Multi-type specific form states
  const [mcAudioUrl, setMcAudioUrl] = useState('')
  const [mcOptions, setMcOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])
  const [translationPrompt, setTranslationPrompt] = useState('')
  const [translationExpected, setTranslationExpected] = useState('')
  const [fillSentence, setFillSentence] = useState('')
  const [fillAnswer, setFillAnswer] = useState('')
  const [arrangeWords, setArrangeWords] = useState<string[]>(['', '', ''])
  const [arrangeCorrectSentence, setArrangeCorrectSentence] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<LessonExercise | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch exercises and dependent data
  const fetchExercisesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [exList, lessonList] = await Promise.all([
        adminService.getExercises().catch(() => []),
        adminService.getLessons().catch(() => []),
      ])

      let aggregatedExercises: LessonExercise[] = Array.isArray(exList) ? exList : []

      // If global getExercises returned empty, aggregate exercises from lesson details
      if (aggregatedExercises.length === 0 && Array.isArray(lessonList) && lessonList.length > 0) {
        const details = await Promise.all(
          lessonList.map((les) => adminService.getLessonDetail(les._id).catch(() => null))
        )
        const collected: LessonExercise[] = []
        details.forEach((d) => {
          if (d && Array.isArray(d.exercises)) {
            collected.push(...d.exercises)
          }
        })
        aggregatedExercises = collected
      }

      setExercises(aggregatedExercises)
      setLessons(Array.isArray(lessonList) ? lessonList : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách bài tập từ server.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExercisesData()
  }, [fetchExercisesData])

  const filteredExercises = exercises.filter((ex) => {
    const qText = ex.question || ex.content?.question || ex.content?.prompt || ex.content?.sentence || ''
    const vocabText = ex.vocabularyName || ''
    const matchesSearch =
      qText.toLowerCase().includes(search.toLowerCase()) ||
      vocabText.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === 'all' || ex.type === typeFilter
    return matchesSearch && matchesType
  })

  // Modal open handlers
  const handleOpenCreateModal = () => {
    setEditingItem(null)
    setSelectedLessonId(lessons.length > 0 ? lessons[0]._id : '')
    setExerciseType('multiple_choice')
    setQuestion('')
    setXp(5)
    setStatus('active')
    setExplanation('')

    setMcAudioUrl('')
    setMcOptions([
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ])
    setTranslationPrompt('')
    setTranslationExpected('')
    setFillSentence('')
    setFillAnswer('')
    setArrangeWords(['', '', ''])
    setArrangeCorrectSentence('')

    setIsModalOpen(true)
  }

  const handleOpenEditModal = (ex: LessonExercise) => {
    setEditingItem(ex)
    const exLessonId = (ex as LessonExercise & { lessonId?: string }).lessonId
    setSelectedLessonId(exLessonId || (lessons.length > 0 ? lessons[0]._id : ''))
    const exType = (ex.type as ExerciseType) || 'multiple_choice'
    setExerciseType(exType)
    setQuestion(ex.question || '')
    setXp(ex.xp || 5)
    setStatus(ex.status || 'active')
    setExplanation(ex.explanation || '')

    const content = ex.content || {}
    const answer = ex.answer || {}

    setMcQuestion(ex.question || content.question || content.prompt || content.sentence || '')
    setMcAudioUrl(content.audio_url || '')

    if (ex.options && ex.options.length >= 2) {
      setMcOptions(ex.options.map((opt) => ({ text: opt.text, isCorrect: Boolean(opt.isCorrect) })))
    } else if (content.options) {
      const corrIdx = answer.correct_option_index ?? 0
      setMcOptions(content.options.map((opt: string, idx: number) => ({
        text: opt,
        isCorrect: idx === corrIdx,
      })))
    }

    setTranslationPrompt(content.prompt || ex.question || '')
    setTranslationExpected(answer.expected_answer || '')
    setFillSentence(content.sentence || ex.question || '')
    setFillAnswer(answer.blank_answer || '')
    setArrangeWords(content.words || ['', '', ''])
    setArrangeCorrectSentence(answer.correct_sentence || '')

    setIsModalOpen(true)
  }

  const setMcQuestion = (val: string) => setQuestion(val)

  // Submit Handler for Create / Update
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem && !selectedLessonId) {
      toast.error('Vui lòng chọn Bài Học (Lesson) cho bài tập!')
      return
    }

    const validOptions = mcOptions.filter((o) => o.text.trim().length > 0)
    const validWords = arrangeWords.filter((w) => w.trim().length > 0)

    let finalQuestionText = question
    let contentObj: Record<string, unknown> = {}
    let answerObj: Record<string, unknown> = {}

    if (exerciseType === 'multiple_choice') {
      if (!question.trim()) {
        toast.error('Vui lòng nhập câu hỏi!')
        return
      }
      if (validOptions.length < 2) {
        toast.error('Cần ít nhất 2 lựa chọn đáp án!')
        return
      }
      const correctIdx = validOptions.findIndex((o) => o.isCorrect)
      if (correctIdx === -1) {
        toast.error('Vui lòng chọn 1 đáp án ĐÚNG!')
        return
      }
      contentObj = { question, options: validOptions.map((o) => o.text) }
      answerObj = { correct_option_index: correctIdx }
    } else if (exerciseType === 'listening') {
      if (!mcAudioUrl.trim()) {
        toast.error('Vui lòng nhập Audio URL!')
        return
      }
      finalQuestionText = question.trim() || 'Nghe audio và chọn đáp án đúng'
      contentObj = { audio_url: mcAudioUrl, question: finalQuestionText, options: validOptions.map((o) => o.text) }
      answerObj = { correct_option_index: validOptions.findIndex((o) => o.isCorrect) }
    } else if (exerciseType === 'translation') {
      if (!translationPrompt.trim() || !translationExpected.trim()) {
        toast.error('Vui lòng nhập câu hỏi và câu dịch chuẩn!')
        return
      }
      finalQuestionText = `Dịch câu: ${translationPrompt}`
      contentObj = { prompt: translationPrompt }
      answerObj = { expected_answer: translationExpected }
    } else if (exerciseType === 'fill_blank') {
      if (!fillSentence.trim() || !fillAnswer.trim()) {
        toast.error('Vui lòng nhập câu chỗ trống và đáp án!')
        return
      }
      finalQuestionText = `Điền từ vào chỗ trống: ${fillSentence}`
      contentObj = { sentence: fillSentence }
      answerObj = { blank_answer: fillAnswer }
    } else if (exerciseType === 'sentence_arrangement') {
      if (validWords.length < 2 || !arrangeCorrectSentence.trim()) {
        toast.error('Vui lòng nhập ít nhất 2 từ và câu hoàn chỉnh đúng!')
        return
      }
      finalQuestionText = `Sắp xếp các từ: ${validWords.join(' / ')}`
      contentObj = { words: validWords }
      answerObj = { correct_sentence: arrangeCorrectSentence }
    }

    const payload: Partial<LessonExercise> = {
      type: exerciseType,
      question: finalQuestionText,
      xp,
      status,
      explanation,
      content: contentObj,
      answer: answerObj,
      options: validOptions,
    }

    try {
      setIsSubmitting(true)
      if (editingItem) {
        // UPDATE
        await adminService.updateExercise(editingItem._id, payload)
        toast.success('Cập nhật bài tập thành công!')
      } else {
        // CREATE
        await adminService.createExercise(selectedLessonId, payload)
        toast.success('Tạo bài tập mới thành công!')
      }

      // Close modal, reset editing item, and immediately re-fetch list from server
      setIsModalOpen(false)
      setEditingItem(null)
      await fetchExercisesData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      setIsDeleting(true)
      await adminService.deleteExercise(deleteTarget._id)
      toast.success(`Đã xóa bài tập!`)
      setDeleteTarget(null)
      await fetchExercisesData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa bài tập thất bại.'
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const renderTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '🔠 Multiple Choice'
      case 'listening':
        return '🎧 Listening'
      case 'translation':
        return '🌐 Translation'
      case 'fill_blank':
      case 'fill_in_blank':
        return '✏️ Fill Blank'
      case 'sentence_arrangement':
        return '🧩 Arrangement'
      default:
        return type
    }
  }

  return (
    <AdminLayout title="Quản Lý Bài Tập (Exercises)" breadcrumbs={[{ label: 'Exercises' }]}>
      <div className="admin-page-header">
        <div className="admin-page-title-group">
          <h2>Danh Sách Bài Tập Thực Hành (Exercise CRUD)</h2>
          <p className="admin-page-subtitle">Quản lý bộ 5 bài tập: Trắc nghiệm, Luyện nghe, Dịch câu, Điền từ, Sắp xếp câu</p>
        </div>
        <button className="btn-admin-primary" onClick={handleOpenCreateModal}>
          ➕ Tạo Bài Tập Mới
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="🔍 Tìm tiêu đề bài tập hoặc từ vựng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Tất cả Loại bài tập</option>
          <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
          <option value="listening">Listening (Luyện nghe)</option>
          <option value="translation">Translation (Dịch câu)</option>
          <option value="fill_blank">Fill Blank (Điền từ)</option>
          <option value="sentence_arrangement">Sentence Arrangement (Sắp xếp câu)</option>
        </select>
      </div>

      {loading ? (
        <AdminLoadingState message="Đang tải danh sách bài tập..." />
      ) : error ? (
        <AdminErrorState message={error} onRetry={fetchExercisesData} />
      ) : filteredExercises.length === 0 ? (
        <AdminEmptyState
          icon="✍️"
          title="Không tìm thấy bài tập nào"
          description="Thử thay đổi từ khóa hoặc bộ lọc, hoặc bấm 'Tạo Bài Tập Mới'."
          actionLabel="Tạo Bài Tập Mới"
          onAction={handleOpenCreateModal}
        />
      ) : (
        <div className="admin-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nội Dung Bài Tập</th>
                  <th>Loại Bài Tập</th>
                  <th>Điểm XP</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredExercises.map((ex) => (
                  <tr key={ex._id}>
                    <td style={{ fontWeight: 700, maxWidth: '320px' }}>
                      {ex.question || ex.content?.question || ex.content?.prompt || ex.content?.sentence || (typeof ex.vocabulary_id === 'object' && ex.vocabulary_id !== null ? ex.vocabulary_id.word : '') || 'Multiple Choice Exercise'}
                    </td>
                    <td>
                      <span className="badge-pill badge-a1">{renderTypeLabel(ex.type)}</span>
                    </td>
                    <td>⚡ <strong>{ex.xp || 5}</strong> XP</td>
                    <td>
                      <span className={`badge-pill ${ex.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {ex.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn-admin-secondary"
                          onClick={() => handleOpenEditModal(ex)}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          className="btn-admin-danger"
                          onClick={() => setDeleteTarget(ex)}
                        >
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

      {/* Create / Edit Exercise Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingItem ? `Chỉnh Sửa Bài Tập` : 'Tạo Bài Tập Mới'}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmitForm}>
          {!editingItem && (
            <div className="form-group">
              <label className="form-label">Chọn Bài Học (Lesson) *</label>
              <select
                className="form-select"
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                required
              >
                <option value="" disabled>-- Select Lesson --</option>
                {lessons.map((les) => (
                  <option key={les._id} value={les._id}>
                    {les.title || les.lektion_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Loại Bài Tập (Exercise Type) *</label>
            <select
              className="form-select"
              value={exerciseType}
              onChange={(e) => setExerciseType(e.target.value as ExerciseType)}
              required
            >
              <option value="multiple_choice">Multiple Choice (Trắc nghiệm)</option>
              <option value="listening">Listening (Luyện nghe)</option>
              <option value="translation">Translation (Dịch câu)</option>
              <option value="fill_blank">Fill Blank (Điền từ)</option>
              <option value="sentence_arrangement">Sentence Arrangement (Sắp xếp câu)</option>
            </select>
          </div>

          {(exerciseType === 'multiple_choice' || exerciseType === 'listening') && (
            <div>
              <div className="form-group">
                <label className="form-label">Câu Hỏi (Question) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Nghĩa của 'Hallo' là gì?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                />
              </div>

              {exerciseType === 'listening' && (
                <div className="form-group">
                  <label className="form-label">Audio URL *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/audio.mp3"
                    value={mcAudioUrl}
                    onChange={(e) => setMcAudioUrl(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Các Đáp Án (Options & Correct) *</label>
                {mcOptions.map((opt, oIdx) => (
                  <div key={oIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={opt.isCorrect}
                      onChange={() => setMcOptions(mcOptions.map((o, idx) => ({ ...o, isCorrect: idx === oIdx })))}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Đáp án ${oIdx + 1}`}
                      value={opt.text}
                      onChange={(e) => {
                        const val = e.target.value
                        setMcOptions(mcOptions.map((o, idx) => (idx === oIdx ? { ...o, text: val } : o)))
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {exerciseType === 'translation' && (
            <div>
              <div className="form-group">
                <label className="form-label">Câu Gốc Cần Dịch (Prompt) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Xin chào, tôi tên là Peter."
                  value={translationPrompt}
                  onChange={(e) => setTranslationPrompt(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Câu Dịch Chuẩn Tiếng Đức (Expected Answer) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Hallo, ich heiße Peter."
                  value={translationExpected}
                  onChange={(e) => setTranslationExpected(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {exerciseType === 'fill_blank' && (
            <div>
              <div className="form-group">
                <label className="form-label">Câu Chứa Chỗ Trống (Sentence) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Ich ___ aus Deutschland."
                  value={fillSentence}
                  onChange={(e) => setFillSentence(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Từ Điền Vào Chỗ Trống (Blank Answer) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: komme"
                  value={fillAnswer}
                  onChange={(e) => setFillAnswer(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {exerciseType === 'sentence_arrangement' && (
            <div>
              <div className="form-group">
                <label className="form-label">Các Từ Rời Rạc (Words) *</label>
                {arrangeWords.map((word, wIdx) => (
                  <div key={wIdx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={`Từ ${wIdx + 1}`}
                      value={word}
                      onChange={(e) => {
                        const val = e.target.value
                        setArrangeWords(arrangeWords.map((w, idx) => (idx === wIdx ? val : w)))
                      }}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-admin-secondary"
                  style={{ fontSize: '0.8rem', marginTop: '4px' }}
                  onClick={() => setArrangeWords((prev) => [...prev, ''])}
                >
                  ➕ Thêm Từ
                </button>
              </div>
              <div className="form-group">
                <label className="form-label">Câu Hoàn Chỉnh Đúng (Correct Sentence) *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ví dụ: Ich wohne in Berlin."
                  value={arrangeCorrectSentence}
                  onChange={(e) => setArrangeCorrectSentence(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Điểm Thưởng (XP)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={xp}
                onChange={(e) => setXp(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Trạng Thái (Status)</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusType)}
              >
                <option value="active">Active (Hoạt động)</option>
                <option value="draft">Draft (Bản nháp)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Giải Thích Đáp Án (Explanation)</label>
            <textarea
              className="form-textarea"
              placeholder="Nhập giải thích cho học viên xem sau khi trả lời..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
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
              {isSubmitting ? 'Đang lưu...' : editingItem ? 'Cập Nhật' : 'Tạo Bài Tập'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Xác nhận xóa Bài tập"
        message="Bạn có chắc chắn muốn xóa bài tập này?"
        itemName={deleteTarget ? deleteTarget.question : ''}
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminExercises
