import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import { useAuth } from '../../../contexts/AuthContext'
import { useSubscription } from '../../../hooks/useSubscription'
import { checkInteractivePermissions } from '../../../utils/interactivePermissions'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type {
  InteractiveLesson,
  InteractiveActivity,
} from '../../../types/interactiveClass'
import type { VocabularyItem } from '../../../types/vocabulary'
import { VocabularySearchAutocomplete } from '../components/VocabularySearchAutocomplete'
import { CreateVocabularyModal } from '../components/CreateVocabularyModal'
import { ActivityBuilder } from '../components/ActivityBuilder'
import '../../../styles/pages/interactive-classes.css'

export const LessonEditorPage = () => {
  const { classId = '', lessonId } = useParams<{ classId: string; lessonId?: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(lessonId)
  const { user } = useAuth()
  const { subscription, loading: subLoading } = useSubscription()
  const permissions = checkInteractivePermissions(user, subscription)

  useEffect(() => {
    if (!subLoading && !permissions.canManageClasses) {
      toast.error('Chỉ tài khoản gói CUSTOM mới có quyền tạo và chỉnh sửa bài học tương tác.')
      navigate(`/interactive-room/classes/${classId}`)
    }
  }, [subLoading, permissions.canManageClasses, navigate, classId])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [level, setLevel] = useState('A1.1')
  const [status, setStatus] = useState<'draft' | 'published'>('published')
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([])
  const [activities, setActivities] = useState<InteractiveActivity[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [isCreateVocabOpen, setIsCreateVocabOpen] = useState(false)
  const [createVocabKeyword, setCreateVocabKeyword] = useState('')

  // Load existing lesson if editing
  const loadLesson = useCallback(async () => {
    if (!lessonId) return
    setLoading(true)
    try {
      const data = await interactiveClassService.getLessonById(lessonId)
      setTitle(data.title || '')
      setDescription(data.description || '')
      setLevel(data.level || 'A1.1')
      setStatus((data.status as 'draft' | 'published') || 'published')

      // Unpack vocabularies
      if (Array.isArray(data.vocabularies)) {
        const fullVocabs: VocabularyItem[] = data.vocabularies.map((v: VocabularyItem | string) =>
          typeof v === 'object' ? (v as VocabularyItem) : ({ _id: v, word: v, meaning: '' } as VocabularyItem),
        )
        setVocabularies(fullVocabs)
      }

      // Load activities
      try {
        const actList = await interactiveClassService.getActivities(lessonId)
        setActivities(actList)
      } catch {
        if (Array.isArray(data.activities)) {
          setActivities(data.activities as unknown as InteractiveActivity[])
        }
      }
    } catch (err: unknown) {
      console.error('Error loading lesson:', err)
      toast.error('Không thể tải thông tin bài học.')
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    if (isEditing) {
      loadLesson()
    }
  }, [isEditing, loadLesson])

  const handleAddVocabulary = (vocab: VocabularyItem) => {
    const vId = vocab._id || (vocab as { id?: string }).id || ''
    const exists = vocabularies.some((v) => (v._id || (v as { id?: string }).id) === vId)
    if (exists) {
      toast('Từ vựng này đã có trong bài học!', { icon: 'ℹ️' })
      return
    }

    setVocabularies((prev) => [...prev, vocab])
    toast.success(`Đã thêm "${vocab.word}" vào bài học`)
  }

  // IMPORTANT: Remove vocabulary from lesson ONLY - DO NOT delete global vocabulary!
  const handleRemoveVocabulary = (index: number) => {
    setVocabularies((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleOpenCreateVocab = (keyword: string) => {
    setCreateVocabKeyword(keyword)
    setIsCreateVocabOpen(true)
  }

  const handleCreatedVocabulary = (newVocab: VocabularyItem) => {
    handleAddVocabulary(newVocab)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài học')
      return
    }

    setSaving(true)
    try {
      const vocabIds = vocabularies.map((v) => v._id || (v as { id?: string }).id || '')

      let savedLesson: InteractiveLesson

      if (isEditing && lessonId) {
        savedLesson = await interactiveClassService.updateLesson(lessonId, {
          title: title.trim(),
          description: description.trim() || undefined,
          level,
          vocabularies: vocabIds,
          status,
        })
      } else {
        savedLesson = await interactiveClassService.createLesson({
          class_id: classId,
          title: title.trim(),
          description: description.trim() || undefined,
          level,
          vocabularies: vocabIds,
          status,
        })
      }

      const currentLessonId = savedLesson._id || savedLesson.id || lessonId || ''

      // Save/Create activities
      if (currentLessonId) {
        for (const act of activities) {
          if (act._id && !act._id.startsWith('temp_')) {
            await interactiveClassService.updateActivity(act._id, {
              title: act.title,
              config: act.config,
              order: act.order,
            }).catch(() => {})
          } else {
            await interactiveClassService.createActivity({
              lesson_id: currentLessonId,
              type: act.type,
              title: act.title,
              config: act.config,
              order: act.order,
            }).catch(() => {})
          }
        }
      }

      toast.success(isEditing ? 'Cập nhật bài học thành công!' : 'Tạo bài học tương tác thành công! 🎉')
      navigate(`/interactive-room/classes/${classId}`)
    } catch (err: unknown) {
      console.error('Error saving lesson:', err)
      const errorMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi khi lưu bài học. Vui lòng thử lại!'
      toast.error(errorMsg)
    } finally {
      setSaving(false)
    }
  }

  const existingVocabIds = vocabularies.map((v) => v._id || (v as { id?: string }).id || '')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '3rem 0 5rem', backgroundColor: '#F8FAFC' }}>
        <div className="ic-container" style={{ maxWidth: '960px' }}>
          {/* Back button */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={() => navigate(`/interactive-room/classes/${classId}`)}
            >
              ← Quay lại lớp học
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="ic-page-header">
              <div className="ic-title-group">
                <h1>{isEditing ? 'Chỉnh Sửa Bài Học' : 'Tạo Bài Học Tương Tác'}</h1>
                <p>Thiết lập danh sách từ vựng và các hoạt động tương tác thời gian thực.</p>
              </div>

              <div className="ic-actions-group">
                <button
                  type="button"
                  className="ic-btn ic-btn-outline"
                  onClick={() => navigate(`/interactive-room/classes/${classId}`)}
                  disabled={saving}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="ic-btn ic-btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Đang lưu...' : 'Lưu bài học'}
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748B' }}>
                <p>Đang tải bài học...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* SECTION 1: BASIC INFO */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    padding: '28px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Oswald',
                      fontSize: '1.4rem',
                      color: '#0F172A',
                      margin: '0 0 20px 0',
                    }}
                  >
                    1. THÔNG TIN BÀI HỌC
                  </h3>

                  <div className="ic-form-group">
                    <label className="ic-label">
                      Tiêu đề bài học <span style={{ color: '#D90000' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="ic-input"
                      placeholder="VD: Familie & Freunde (Gia đình & Bạn bè)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ic-form-group">
                    <label className="ic-label">Mô tả bài học</label>
                    <textarea
                      className="ic-textarea"
                      placeholder="Nhập mô tả mục tiêu học tập, chủ đề giao tiếp..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="ic-form-group">
                      <label className="ic-label">Cấp độ (Level)</label>
                      <select
                        className="ic-select"
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                      >
                        <option value="A1.1">A1.1</option>
                        <option value="A1.2">A1.2</option>
                        <option value="A2.1">A2.1</option>
                        <option value="A2.2">A2.2</option>
                        <option value="B1.1">B1.1</option>
                        <option value="B1.2">B1.2</option>
                      </select>
                    </div>

                    <div className="ic-form-group">
                      <label className="ic-label">Trạng thái phát hành</label>
                      <select
                        className="ic-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                      >
                        <option value="published">Xuất bản (Published)</option>
                        <option value="draft">Bản nháp (Draft)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: VOCABULARY SECTION */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    padding: '28px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3
                        style={{
                          fontFamily: 'Oswald',
                          fontSize: '1.4rem',
                          color: '#0F172A',
                          margin: 0,
                        }}
                      >
                        2. TỪ VỰNG BÀI HỌC ({vocabularies.length})
                      </h3>
                      <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.9rem' }}>
                        Tìm kiếm từ vựng có sẵn trong từ điển hệ thống hoặc tạo từ vựng mới.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="ic-btn ic-btn-outline ic-btn-sm"
                      onClick={() => handleOpenCreateVocab('')}
                    >
                      + Tạo từ vựng mới
                    </button>
                  </div>

                  {/* Autocomplete Input */}
                  <div style={{ marginBottom: '20px' }}>
                    <VocabularySearchAutocomplete
                      onSelectVocabulary={handleAddVocabulary}
                      onOpenCreateModal={handleOpenCreateVocab}
                      existingIds={existingVocabIds}
                    />
                  </div>

                  {/* Added Vocabularies List */}
                  {vocabularies.length === 0 ? (
                    <div
                      style={{
                        padding: '24px',
                        border: '2px dashed #E2E8F0',
                        borderRadius: '16px',
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      Chưa có từ vựng nào trong bài học này. Hãy tìm kiếm ở trên để thêm từ!
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '12px',
                      }}
                    >
                      {vocabularies.map((vocab, idx) => {
                        const displayWord = vocab.article
                          ? `${vocab.article} ${vocab.word}`
                          : vocab.word

                        return (
                          <div
                            key={vocab._id || (vocab as { id?: string }).id || idx}
                            style={{
                              background: '#F8FAFC',
                              borderRadius: '14px',
                              padding: '12px 16px',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                            }}
                          >
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {displayWord}
                              </div>
                              <div style={{ color: '#64748B', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {vocab.meaning}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveVocabulary(idx)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                fontSize: '1.1rem',
                                padding: '4px',
                                flexShrink: 0,
                              }}
                              title="Xóa khỏi bài học"
                            >
                              ✕
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* SECTION 3: ACTIVITIES SECTION */}
                <div
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    padding: '28px',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Oswald',
                      fontSize: '1.4rem',
                      color: '#0F172A',
                      margin: '0 0 8px 0',
                    }}
                  >
                    3. HOẠT ĐỘNG TƯƠNG TÁC (ACTIVITIES)
                  </h3>
                  <p style={{ margin: '0 0 20px 0', color: '#64748B', fontSize: '0.9rem' }}>
                    Thêm các hoạt động tương tác Flashcard, Trắc nghiệm (Quiz) và Vòng quay từ vựng (Spin).
                  </p>

                  <ActivityBuilder
                    activities={activities}
                    onChange={setActivities}
                    disabled={saving}
                  />
                </div>

                {/* Bottom Save Bar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <button
                    type="button"
                    className="ic-btn ic-btn-outline"
                    onClick={() => navigate(`/interactive-room/classes/${classId}`)}
                    disabled={saving}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="ic-btn ic-btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu bài học'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>

      <Footer />

      {/* Create New Vocabulary Modal */}
      <CreateVocabularyModal
        isOpen={isCreateVocabOpen}
        initialWord={createVocabKeyword}
        initialLevel={level}
        onClose={() => setIsCreateVocabOpen(false)}
        onSuccess={handleCreatedVocabulary}
      />
    </div>
  )
}
