import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import AdminEmptyState from '../../components/admin/AdminEmptyState'
import AdminLoadingState from '../../components/admin/AdminLoadingState'
import AdminErrorState from '../../components/admin/AdminErrorState'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import Modal from '../../components/admin/Modal'
import { adminService } from '../../services/adminService'
import type {
  LessonItem,
  LessonPreviewVocabulary,
  LessonExercise,
  VocabularyAdminItem,
  UnitItem,
  StatusType,
  ExerciseType,
} from '../../types/admin'
import type { ExerciseContentPayload, ExerciseAnswerPayload } from '../../types/exercise'
import { toast } from 'react-hot-toast'

export const AdminLessonBuilder: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<LessonItem | null>(null)
  const [vocabularies, setVocabularies] = useState<LessonPreviewVocabulary[]>([])
  const [exercises, setExercises] = useState<LessonExercise[]>([])
  const [units, setUnits] = useState<UnitItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Edit Lesson Info Modal
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false)
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    estimated_minutes: 15,
    xp: 20,
    status: 'active' as StatusType,
    unit_id: '',
  })
  const [isUpdatingLesson, setIsUpdatingLesson] = useState(false)

  // 2. Add Vocabulary Modal
  const [isAddVocabModalOpen, setIsAddVocabModalOpen] = useState(false)
  const [dbVocabularies, setDbVocabularies] = useState<VocabularyAdminItem[]>([])
  const [vocabSearch, setVocabSearch] = useState('')
  const [vocabLoading, setVocabLoading] = useState(false)

  // View Vocab Detail Modal
  const [viewingVocab, setViewingVocab] = useState<LessonPreviewVocabulary | null>(null)

  // 3. Exercise Modal States (Phase 4 multi-type)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [exerciseStep, setExerciseStep] = useState<1 | 2>(1) // Step 1: Pick Type, Step 2: Form
  const [editingExercise, setEditingExercise] = useState<LessonExercise | null>(null)

  const [exerciseType, setExerciseType] = useState<ExerciseType>('multiple_choice')
  const [exerciseVocabularyId, setExerciseVocabularyId] = useState<string>('')
  const [exerciseXp, setExerciseXp] = useState<number>(5)
  const [exerciseStatus, setExerciseStatus] = useState<StatusType>('active')
  const [exerciseExplanation, setExerciseExplanation] = useState<string>('')

  // Type specific form states
  // Multiple Choice / Listening
  const [mcQuestion, setMcQuestion] = useState<string>('')
  const [mcAudioUrl, setMcAudioUrl] = useState<string>('')
  const [mcOptions, setMcOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  // Translation
  const [translationPrompt, setTranslationPrompt] = useState<string>('')
  const [translationExpected, setTranslationExpected] = useState<string>('')

  // Fill Blank
  const [fillSentence, setFillSentence] = useState<string>('')
  const [fillAnswer, setFillAnswer] = useState<string>('')

  // Sentence Arrangement
  const [arrangeWords, setArrangeWords] = useState<string[]>(['', '', ''])
  const [arrangeCorrectSentence, setArrangeCorrectSentence] = useState<string>('')

  const [isSavingExercise, setIsSavingExercise] = useState(false)

  // Exercise View Modal & Delete
  const [viewingExercise, setViewingExercise] = useState<LessonExercise | null>(null)
  const [deleteExerciseTarget, setDeleteExerciseTarget] = useState<LessonExercise | null>(null)
  const [isDeletingExercise, setIsDeletingExercise] = useState(false)

  const fetchLessonData = useCallback(async () => {
    if (!lessonId) return
    try {
      setLoading(true)
      setError(null)

      const [detailData, unitList] = await Promise.all([
        adminService.getLessonDetail(lessonId),
        adminService.getUnits(),
      ])

      setLesson(detailData.lesson)
      setVocabularies(detailData.vocabularies.sort((a, b) => a.order - b.order))
      setExercises(detailData.exercises.sort((a, b) => a.order - b.order))
      setUnits(unitList)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải chi tiết bài học.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [lessonId])

  useEffect(() => {
    fetchLessonData()
  }, [fetchLessonData])

  // --- 1. LESSON INFO HANDLERS ---
  const handleOpenEditLessonModal = () => {
    if (!lesson) return
    const unitIdVal = typeof lesson.unit_id === 'object' ? lesson.unit_id._id : (lesson.unit_id || (typeof lesson.unit === 'object' ? lesson.unit._id : lesson.unit) || '')
    setLessonFormData({
      title: lesson.title || lesson.lektion_name || '',
      description: lesson.description || '',
      estimated_minutes: lesson.estimated_minutes || 15,
      xp: lesson.xp || 20,
      status: lesson.status || 'active',
      unit_id: String(unitIdVal),
    })
    setIsEditLessonModalOpen(true)
  }

  const handleSaveLessonInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonId || !lessonFormData.title.trim()) return

    try {
      setIsUpdatingLesson(true)
      const updated = await adminService.updateLesson(lessonId, lessonFormData)
      setLesson((prev) => (prev ? { ...prev, ...updated, ...lessonFormData } : null))
      toast.success('Cập nhật thông tin bài học thành công!')
      setIsEditLessonModalOpen(false)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Cập nhật thất bại.'
      toast.error(msg)
    } finally {
      setIsUpdatingLesson(false)
    }
  }

  const getUnitName = () => {
    if (!lesson) return 'N/A'
    if (typeof lesson.unit_id === 'object' && (lesson.unit_id?.name || lesson.unit_id?.unit_name)) {
      return lesson.unit_id.name || lesson.unit_id.unit_name
    }
    if (typeof lesson.unit === 'object' && (lesson.unit?.name || lesson.unit?.unit_name)) {
      return lesson.unit.name || lesson.unit.unit_name
    }
    const found = units.find((u) => u._id === lesson.unit_id || u._id === lesson.unit)
    return found ? found.name || found.unit_name : 'N/A'
  }

  const getTopicName = () => {
    if (!lesson) return 'N/A'
    if (typeof lesson.topic_id === 'object' && (lesson.topic_id?.name || lesson.topic_id?.topic_name)) {
      return lesson.topic_id.name || lesson.topic_id.topic_name
    }
    if (typeof lesson.topic === 'object' && (lesson.topic?.name || lesson.topic?.topic_name)) {
      return lesson.topic.name || lesson.topic.topic_name
    }
    return 'Chưa gán Topic'
  }

  // --- 2. VOCABULARY PREVIEW HANDLERS ---
  const handleOpenAddVocabModal = async () => {
    setIsAddVocabModalOpen(true)
    try {
      setVocabLoading(true)
      const res = await adminService.getVocabularies({ limit: 50 })
      setDbVocabularies(res.vocabularies)
    } catch (err) {
      console.warn('Failed to load DB vocabularies:', err)
    } finally {
      setVocabLoading(false)
    }
  }

  const handleSearchDbVocab = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setVocabLoading(true)
      const res = await adminService.getVocabularies({ q: vocabSearch, limit: 50 })
      setDbVocabularies(res.vocabularies)
    } catch (err) {
      console.warn('Search vocab error:', err)
    } finally {
      setVocabLoading(false)
    }
  }

  const handleAddVocabToLesson = async (v: VocabularyAdminItem) => {
    if (!lessonId) return
    const isAlreadyIn = vocabularies.some((item) => item.vocabularyId === v._id || item._id === v._id)
    if (isAlreadyIn) {
      toast.error('Từ vựng này đã có trong danh sách bài học!')
      return
    }

    const nextOrder = vocabularies.length + 1
    try {
      await adminService.addVocabularyToLesson(lessonId, v._id, nextOrder, true)
      const newPreviewItem: LessonPreviewVocabulary = {
        _id: `pv_${Date.now()}`,
        vocabularyId: v._id,
        word: v.word,
        meaning: v.meaning,
        gender: (v as { gender?: string }).gender,
        phonetic: v.pronunciation,
        order: nextOrder,
        is_new: true,
        level: v.level,
        type: v.part_of_speech,
      }
      setVocabularies((prev) => [...prev, newPreviewItem])
      toast.success(`Đã thêm từ "${v.word}" vào bài học!`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thêm từ vựng.'
      toast.error(msg)
    }
  }

  const handleRemoveVocabFromLesson = async (pv: LessonPreviewVocabulary) => {
    if (!lessonId) return
    try {
      await adminService.removeVocabularyFromLesson(lessonId, pv.vocabularyId || pv._id)
      setVocabularies((prev) => prev.filter((item) => item._id !== pv._id && item.vocabularyId !== pv.vocabularyId))
      toast.success(`Đã loại bỏ từ "${pv.word}" khỏi bài học.`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể loại bỏ từ vựng.'
      toast.error(msg)
    }
  }

  const handleToggleIsNew = async (pv: LessonPreviewVocabulary) => {
    if (!lessonId) return
    const updatedStatus = !pv.is_new
    try {
      await adminService.updateLessonVocabulary(lessonId, pv.vocabularyId || pv._id, { is_new: updatedStatus })
      setVocabularies((prev) =>
        prev.map((item) => (item._id === pv._id ? { ...item, is_new: updatedStatus } : item)),
      )
      toast.success(`Đã đổi trạng thái "${pv.word}" thành ${updatedStatus ? 'Từ Mới' : 'Từ Ôn Tập'}`)
    } catch (err) {
      console.warn('Failed toggle is_new:', err)
    }
  }

  const handleMoveVocab = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === vocabularies.length - 1) return

    const newArr = [...vocabularies]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    const temp = newArr[index]
    newArr[index] = newArr[targetIdx]
    newArr[targetIdx] = temp

    const reordered = newArr.map((item, idx) => ({ ...item, order: idx + 1 }))
    setVocabularies(reordered)
    toast.success('Đã cập nhật thứ tự từ vựng!')
  }

  // --- 3. EXERCISE BUILDER HANDLERS (PHASE 4) ---
  const handleOpenCreateExerciseModal = () => {
    setEditingExercise(null)
    setExerciseStep(1)
    setExerciseType('multiple_choice')
    setExerciseVocabularyId(vocabularies.length > 0 ? vocabularies[0].vocabularyId || vocabularies[0]._id : '')
    setExerciseXp(5)
    setExerciseStatus('active')
    setExerciseExplanation('')

    // Reset forms
    setMcQuestion('')
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

    setIsExerciseModalOpen(true)
  }

  const handleOpenEditExerciseModal = (ex: LessonExercise) => {
    setEditingExercise(ex)
    setExerciseStep(2)
    const exType = (ex.type as ExerciseType) || 'multiple_choice'
    setExerciseType(exType)
    setExerciseVocabularyId(ex.vocabularyId || '')
    setExerciseXp(ex.xp || 5)
    setExerciseStatus(ex.status || 'active')
    setExerciseExplanation(ex.explanation || '')

    const content = ex.content || {}
    const answer = ex.answer || {}

    // Populate MCQ / Listening
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
    } else {
      setMcOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    }

    // Populate Translation
    setTranslationPrompt(content.prompt || ex.question || '')
    setTranslationExpected(answer.expected_answer || '')

    // Populate Fill Blank
    setFillSentence(content.sentence || ex.question || '')
    setFillAnswer(answer.blank_answer || '')

    // Populate Sentence Arrangement
    setArrangeWords(content.words || ['', '', ''])
    setArrangeCorrectSentence(answer.correct_sentence || '')

    setIsExerciseModalOpen(true)
  }

  const handleSelectType = (selectedType: ExerciseType) => {
    setExerciseType(selectedType)
    // Default XP per type
    if (selectedType === 'multiple_choice') setExerciseXp(5)
    else if (selectedType === 'listening') setExerciseXp(10)
    else if (selectedType === 'translation') setExerciseXp(10)
    else if (selectedType === 'fill_blank') setExerciseXp(10)
    else if (selectedType === 'sentence_arrangement') setExerciseXp(15)

    setExerciseStep(2)
  }

  // Option actions for MCQ & Listening
  const handleAddMcOption = () => {
    setMcOptions((prev) => [...prev, { text: '', isCorrect: false }])
  }

  const handleRemoveMcOption = (index: number) => {
    if (mcOptions.length <= 2) {
      toast.error('Multiple Choice / Listening phải có ít nhất 2 lựa chọn!')
      return
    }
    const newOpts = mcOptions.filter((_, idx) => idx !== index)
    if (!newOpts.some((o) => o.isCorrect)) {
      newOpts[0].isCorrect = true
    }
    setMcOptions(newOpts)
  }

  // Word actions for Sentence Arrangement
  const handleAddArrangeWord = () => {
    setArrangeWords((prev) => [...prev, ''])
  }

  const handleRemoveArrangeWord = (index: number) => {
    if (arrangeWords.length <= 2) {
      toast.error('Sentence Arrangement phải có ít nhất 2 từ rời rạc!')
      return
    }
    setArrangeWords((prev) => prev.filter((_, idx) => idx !== index))
  }

  const handleMoveArrangeWord = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return
    if (direction === 'right' && index === arrangeWords.length - 1) return

    const newArr = [...arrangeWords]
    const targetIdx = direction === 'left' ? index - 1 : index + 1
    const temp = newArr[index]
    newArr[index] = newArr[targetIdx]
    newArr[targetIdx] = temp
    setArrangeWords(newArr)
  }

  // Submit & Validation for Exercise Form
  const handleSaveExercise = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lessonId) return

    const validOptions = mcOptions.filter((opt) => opt.text.trim().length > 0)
    const validWords = arrangeWords.filter((w) => w.trim().length > 0)
    const vocabName = vocabularies.find((v) => v.vocabularyId === exerciseVocabularyId || v._id === exerciseVocabularyId)?.word || 'Tổng hợp'

    let questionText = ''
    let contentObj: ExerciseContentPayload = {}
    let answerObj: ExerciseAnswerPayload = {}

    // Validation per Exercise Type
    if (exerciseType === 'multiple_choice') {
      if (!mcQuestion.trim()) {
        toast.error('Vui lòng nhập câu hỏi cho bài tập Trắc nghiệm!')
        return
      }
      if (validOptions.length < 2) {
        toast.error('Bài tập Trắc nghiệm phải có ít nhất 2 lựa chọn đáp án!')
        return
      }
      const correctIdx = validOptions.findIndex((o) => o.isCorrect)
      if (correctIdx === -1) {
        toast.error('Vui lòng chọn 1 đáp án ĐÚNG!')
        return
      }

      questionText = mcQuestion
      contentObj = { question: mcQuestion, options: validOptions.map((o) => o.text) }
      answerObj = { correct_option_index: correctIdx }
    } else if (exerciseType === 'listening') {
      if (!mcAudioUrl.trim()) {
        toast.error('Bài tập Luyện nghe yêu cầu nhập Audio URL!')
        return
      }
      if (validOptions.length < 2) {
        toast.error('Bài tập Luyện nghe phải có ít nhất 2 lựa chọn đáp án!')
        return
      }
      const correctIdx = validOptions.findIndex((o) => o.isCorrect)
      if (correctIdx === -1) {
        toast.error('Vui lòng chọn 1 đáp án ĐÚNG!')
        return
      }

      questionText = mcQuestion.trim() || 'Nghe audio và chọn đáp án đúng'
      contentObj = { audio_url: mcAudioUrl, question: questionText, options: validOptions.map((o) => o.text) }
      answerObj = { correct_option_index: correctIdx }
    } else if (exerciseType === 'translation') {
      if (!translationPrompt.trim()) {
        toast.error('Vui lòng nhập câu/từ nguồn cần dịch (Prompt)!')
        return
      }
      if (!translationExpected.trim()) {
        toast.error('Vui lòng nhập câu dịch chuẩn (Expected answer)!')
        return
      }

      questionText = `Dịch câu: ${translationPrompt}`
      contentObj = { prompt: translationPrompt }
      answerObj = { expected_answer: translationExpected }
    } else if (exerciseType === 'fill_blank') {
      if (!fillSentence.trim()) {
        toast.error('Vui lòng nhập câu chứa chỗ trống (Sentence)!')
        return
      }
      if (!fillAnswer.trim()) {
        toast.error('Vui lòng nhập từ/cụm từ điền vào chỗ trống (Answer)!')
        return
      }

      questionText = `Điền từ vào chỗ trống: ${fillSentence}`
      contentObj = { sentence: fillSentence }
      answerObj = { blank_answer: fillAnswer }
    } else if (exerciseType === 'sentence_arrangement') {
      if (validWords.length < 2) {
        toast.error('Bài tập Sắp xếp câu phải có ít nhất 2 từ rời rạc!')
        return
      }
      if (!arrangeCorrectSentence.trim()) {
        toast.error('Vui lòng nhập câu hoàn chỉnh đúng (Correct sentence)!')
        return
      }

      questionText = `Sắp xếp các từ thành câu đúng: ${validWords.join(' / ')}`
      contentObj = { words: validWords }
      answerObj = { correct_sentence: arrangeCorrectSentence }
    }

    const payload: Partial<LessonExercise> = {
      order: editingExercise ? editingExercise.order : exercises.length + 1,
      type: exerciseType,
      vocabularyId: exerciseVocabularyId,
      vocabularyName: vocabName,
      xp: exerciseXp,
      status: exerciseStatus,
      question: questionText,
      explanation: exerciseExplanation,
      content: contentObj,
      answer: answerObj,
      options: validOptions,
    }

    try {
      setIsSavingExercise(true)
      if (editingExercise) {
        const updated = await adminService.updateLessonExercise(editingExercise._id, payload)
        setExercises((prev) =>
          prev.map((item) => (item._id === editingExercise._id ? { ...item, ...updated, ...payload } : item)),
        )
        toast.success('Đã cập nhật bài tập thành công!')
      } else {
        const created = await adminService.createLessonExercise(lessonId, payload)
        const newEx: LessonExercise = {
          _id: created?._id || `ex_${Date.now()}`,
          ...payload,
        } as LessonExercise
        setExercises((prev) => [...prev, newEx])
        toast.success('Đã tạo bài tập mới thành công!')
      }
      setIsExerciseModalOpen(false)
      setEditingExercise(null)
      await fetchLessonData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại.'
      toast.error(msg)
    } finally {
      setIsSavingExercise(false)
    }
  }

  const handleDeleteExerciseConfirm = async () => {
    if (!deleteExerciseTarget) return
    try {
      setIsDeletingExercise(true)
      await adminService.deleteLessonExercise(deleteExerciseTarget._id)
      setExercises((prev) => prev.filter((item) => item._id !== deleteExerciseTarget._id))
      toast.success('Đã xóa bài tập!')
      setDeleteExerciseTarget(null)
      await fetchLessonData()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa bài tập thất bại.'
      toast.error(msg)
    } finally {
      setIsDeletingExercise(false)
    }
  }

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === exercises.length - 1) return

    const newArr = [...exercises]
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    const temp = newArr[index]
    newArr[index] = newArr[targetIdx]
    newArr[targetIdx] = temp

    const reordered = newArr.map((item, idx) => ({ ...item, order: idx + 1 }))
    setExercises(reordered)
    toast.success('Đã cập nhật thứ tự bài tập!')
  }

  const getExerciseTypeBadgeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return '🔠 Multiple Choice'
      case 'listening':
        return '🎧 Listening'
      case 'translation':
        return '🌐 Translation'
      case 'fill_blank':
        return '✏️ Fill Blank'
      case 'sentence_arrangement':
        return '🧩 Arrangement'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Lesson Builder" breadcrumbs={[{ label: 'Lessons', path: '/admin/lessons' }, { label: 'Builder' }]}>
        <AdminLoadingState message="Đang tải dữ liệu Builder cho bài học..." />
      </AdminLayout>
    )
  }

  if (error || !lesson) {
    return (
      <AdminLayout title="Lesson Builder" breadcrumbs={[{ label: 'Lessons', path: '/admin/lessons' }, { label: 'Builder' }]}>
        <AdminErrorState message={error || 'Không tìm thấy thông tin bài học.'} onRetry={fetchLessonData} />
      </AdminLayout>
    )
  }

  const lessonTitle = lesson.title || lesson.lektion_name || 'Lesson'

  return (
    <AdminLayout
      title={`Lesson Builder: ${lessonTitle}`}
      breadcrumbs={[{ label: 'Lessons', path: '/admin/lessons' }, { label: lessonTitle }]}
    >
      {/* 1. LESSON INFORMATION SECTION */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <div style={{ marginBottom: '8px' }}>
              <button className="btn-admin-secondary" onClick={() => navigate('/admin/lessons')}>
                ⬅️ Quay Lại Danh Sách Bài Học
              </button>
            </div>
            <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              {lessonTitle}
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.88rem', color: '#64748b' }}>
              <span>Unit: <strong style={{ color: '#2a63e8' }}>{getUnitName()}</strong></span>
              <span>•</span>
              <span>Topic: <strong>{getTopicName()}</strong></span>
            </div>
          </div>
          <button className="btn-admin-secondary" onClick={handleOpenEditLessonModal}>
            ✏️ Edit Lesson Info
          </button>
        </div>

        <p style={{ color: '#475569', fontSize: '0.92rem', margin: '0 0 16px 0' }}>
          {lesson.description || 'Chưa có mô tả cho bài học này.'}
        </p>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
          <span className={`badge-pill ${lesson.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
            Trạng thái: {lesson.status || 'active'}
          </span>
          <span className="badge-pill badge-a1">⏱️ {lesson.estimated_minutes || 15} Phút</span>
          <span className="badge-pill badge-b1">⚡ {lesson.xp || 20} XP Thưởng</span>
          <span className="badge-pill badge-a2">📚 {vocabularies.length} Từ vựng</span>
          <span className="badge-pill badge-c1">✍️ {exercises.length} Bài tập</span>
        </div>
      </div>

      {/* 2. PREVIEW VOCABULARY SECTION */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">📖 PREVIEW VOCABULARY (Từ Vựng Bài Học)</h3>
            <p className="admin-page-subtitle">Thêm từ vựng có sẵn từ Database vào bài học, thiết lập thứ tự và từ mới</p>
          </div>
          <button className="btn-admin-primary" onClick={handleOpenAddVocabModal}>
            ➕ Add Vocabulary
          </button>
        </div>

        {vocabularies.length === 0 ? (
          <AdminEmptyState
            icon="📚"
            title="Bài học chưa có từ vựng nào"
            description="Bấm 'Add Vocabulary' để gắn các từ vựng có sẵn trong Database vào bài học này."
            actionLabel="Add Vocabulary"
            onAction={handleOpenAddVocabModal}
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Từ Tiếng Đức</th>
                  <th>Nghĩa Tiếng Việt</th>
                  <th>Giống / Loại</th>
                  <th>Trạng Thái Từ</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {vocabularies.map((pv, idx) => (
                  <tr key={pv._id}>
                    <td>
                      <strong style={{ color: '#64748b' }}>#{pv.order || idx + 1}</strong>
                    </td>
                    <td>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{pv.word}</strong>
                      {pv.phonetic && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{pv.phonetic}</div>}
                    </td>
                    <td style={{ fontWeight: 600, color: '#334155' }}>{pv.meaning}</td>
                    <td>
                      {pv.gender && <span className="badge-pill badge-a1">{pv.gender}</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleIsNew(pv)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        <span className={`badge-pill ${pv.is_new !== false ? 'badge-a2' : 'badge-draft'}`}>
                          {pv.is_new !== false ? '✨ Từ Mới (New)' : '🔄 Ôn Tập'}
                        </span>
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-admin-secondary"
                          disabled={idx === 0}
                          onClick={() => handleMoveVocab(idx, 'up')}
                          title="Di chuyển lên"
                        >
                          ⬆️
                        </button>
                        <button
                          className="btn-admin-secondary"
                          disabled={idx === vocabularies.length - 1}
                          onClick={() => handleMoveVocab(idx, 'down')}
                          title="Di chuyển xuống"
                        >
                          ⬇️
                        </button>
                        <button className="btn-admin-secondary" onClick={() => setViewingVocab(pv)}>
                          👁️ View
                        </button>
                        <button
                          className="btn-admin-danger"
                          onClick={() => handleRemoveVocabFromLesson(pv)}
                          title="Gỡ khỏi bài học"
                        >
                          ❌ Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. EXERCISES SECTION (PHASE 4 EXERCISE BUILDER) */}
      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">✍️ EXERCISES (Bài Tập Luyện Tập)</h3>
            <p className="admin-page-subtitle">Tạo & quản lý 5 loại bài tập: Multiple Choice, Listening, Translation, Fill Blank, Sentence Arrangement</p>
          </div>
          <button className="btn-admin-primary" onClick={handleOpenCreateExerciseModal}>
            ➕ Add Exercise
          </button>
        </div>

        {exercises.length === 0 ? (
          <AdminEmptyState
            icon="✍️"
            title="Bài học chưa có bài tập nào"
            description="Tạo các bài tập tương tác (Trắc nghiệm, Nghe, Dịch câu, Điền từ, Sắp xếp câu) cho bài học."
            actionLabel="Add Exercise"
            onAction={handleOpenCreateExerciseModal}
          />
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>STT</th>
                  <th>Nội Dung / Yêu Cầu</th>
                  <th>Loại Bài Tập (Type)</th>
                  <th>Từ Vựng Liên Kết</th>
                  <th>Điểm XP</th>
                  <th>Trạng Thái</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {exercises.map((ex, idx) => (
                  <tr key={ex._id}>
                    <td>
                      <strong style={{ color: '#64748b' }}>#{ex.order || idx + 1}</strong>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0f172a', maxWidth: '280px' }}>{ex.question}</td>
                    <td>
                      <span className="badge-pill badge-a1">{getExerciseTypeBadgeLabel(ex.type)}</span>
                    </td>
                    <td style={{ color: '#2a63e8', fontWeight: 600 }}>{ex.vocabularyName || 'Tổng hợp'}</td>
                    <td>⚡ {ex.xp || 5} XP</td>
                    <td>
                      <span className={`badge-pill ${ex.status === 'active' ? 'badge-active' : 'badge-draft'}`}>
                        {ex.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="btn-admin-secondary"
                          disabled={idx === 0}
                          onClick={() => handleMoveExercise(idx, 'up')}
                          title="Di chuyển lên"
                        >
                          ⬆️
                        </button>
                        <button
                          className="btn-admin-secondary"
                          disabled={idx === exercises.length - 1}
                          onClick={() => handleMoveExercise(idx, 'down')}
                          title="Di chuyển xuống"
                        >
                          ⬇️
                        </button>
                        <button className="btn-admin-secondary" onClick={() => setViewingExercise(ex)}>
                          👁️ View
                        </button>
                        <button className="btn-admin-secondary" onClick={() => handleOpenEditExerciseModal(ex)}>
                          ✏️ Edit
                        </button>
                        <button className="btn-admin-danger" onClick={() => setDeleteExerciseTarget(ex)}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Edit Lesson Info Modal */}
      <Modal
        isOpen={isEditLessonModalOpen}
        title="Chỉnh Sửa Thông Tin Bài Học"
        onClose={() => setIsEditLessonModalOpen(false)}
      >
        <form onSubmit={handleSaveLessonInfo}>
          <div className="form-group">
            <label className="form-label">Tiêu Đề Bài Học *</label>
            <input
              type="text"
              className="form-input"
              value={lessonFormData.title}
              onChange={(e) => setLessonFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Thuộc Unit *</label>
            <select
              className="form-select"
              value={lessonFormData.unit_id}
              onChange={(e) => setLessonFormData((prev) => ({ ...prev, unit_id: e.target.value }))}
              required
            >
              {units.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name || u.unit_name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Thời Lượng (Phút)</label>
              <input
                type="number"
                className="form-input"
                min={1}
                value={lessonFormData.estimated_minutes}
                onChange={(e) => setLessonFormData((prev) => ({ ...prev, estimated_minutes: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Điểm Thưởng XP</label>
              <input
                type="number"
                className="form-input"
                min={0}
                value={lessonFormData.xp}
                onChange={(e) => setLessonFormData((prev) => ({ ...prev, xp: Number(e.target.value) }))}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Trạng Thái</label>
            <select
              className="form-select"
              value={lessonFormData.status}
              onChange={(e) => setLessonFormData((prev) => ({ ...prev, status: e.target.value as StatusType }))}
            >
              <option value="active">Active (Hoạt động)</option>
              <option value="draft">Draft (Bản nháp)</option>
              <option value="inactive">Inactive (Tắt)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mô Tả Bài Học</label>
            <textarea
              className="form-textarea"
              value={lessonFormData.description}
              onChange={(e) => setLessonFormData((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-admin-secondary" onClick={() => setIsEditLessonModalOpen(false)}>
              Hủy
            </button>
            <button type="submit" className="btn-admin-primary" disabled={isUpdatingLesson}>
              {isUpdatingLesson ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Add Vocabulary Selection Modal */}
      <Modal
        isOpen={isAddVocabModalOpen}
        title="Chọn Từ Vựng Từ Database Để Thêm Vào Bài Học"
        onClose={() => setIsAddVocabModalOpen(false)}
        maxWidth="780px"
      >
        <form onSubmit={handleSearchDbVocab} className="filter-bar" style={{ marginBottom: '16px' }}>
          <input
            type="text"
            className="filter-input"
            placeholder="🔍 Tìm từ vựng tiếng Đức hoặc nghĩa..."
            value={vocabSearch}
            onChange={(e) => setVocabSearch(e.target.value)}
          />
          <button type="submit" className="btn-admin-secondary">
            Tìm kiếm
          </button>
        </form>

        {vocabLoading ? (
          <AdminLoadingState message="Đang tìm từ vựng trong Database..." />
        ) : dbVocabularies.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>
            Không tìm thấy từ vựng nào trong Database.
          </p>
        ) : (
          <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Từ Tiếng Đức</th>
                  <th>Nghĩa Tiếng Việt</th>
                  <th>Trình Độ</th>
                  <th style={{ textAlign: 'right' }}>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {dbVocabularies.map((v) => {
                  const isAdded = vocabularies.some((pv) => pv.vocabularyId === v._id || pv._id === v._id)
                  return (
                    <tr key={v._id}>
                      <td>
                        <strong>{v.word}</strong>
                        {v.pronunciation && <span style={{ color: '#94a3b8', fontSize: '0.8rem', marginLeft: '6px' }}>{v.pronunciation}</span>}
                      </td>
                      <td style={{ color: '#334155' }}>{v.meaning}</td>
                      <td>
                        <span className="badge-pill badge-a1">{v.level || 'A1'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className={isAdded ? 'btn-admin-secondary' : 'btn-admin-primary'}
                          disabled={isAdded}
                          onClick={() => handleAddVocabToLesson(v)}
                        >
                          {isAdded ? '✓ Đã thêm' : '➕ Thêm vào bài học'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <button className="btn-admin-secondary" onClick={() => setIsAddVocabModalOpen(false)}>
            Đóng
          </button>
        </div>
      </Modal>

      {/* View Vocab Modal */}
      {viewingVocab && (
        <Modal isOpen={Boolean(viewingVocab)} title={`Chi Tiết Từ Vựng: ${viewingVocab.word}`} onClose={() => setViewingVocab(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div><strong>Từ Tiếng Đức:</strong> <span style={{ fontSize: '1.2rem', color: '#2a63e8', fontWeight: 800 }}>{viewingVocab.word}</span></div>
            <div><strong>Phiên âm:</strong> {viewingVocab.phonetic || 'Không có'}</div>
            <div><strong>Giống từ:</strong> {viewingVocab.gender || 'N/A'}</div>
            <div><strong>Nghĩa tiếng Việt:</strong> {viewingVocab.meaning}</div>
            <div><strong>Trạng thái bài học:</strong> {viewingVocab.is_new !== false ? '✨ Từ Mới (New)' : '🔄 Từ Ôn Tập'}</div>
          </div>
          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn-admin-secondary" onClick={() => setViewingVocab(null)}>Đóng</button>
          </div>
        </Modal>
      )}

      {/* 3. PHASE 4 EXERCISE BUILDER MODAL (2-STEP TYPE BUILDER) */}
      <Modal
        isOpen={isExerciseModalOpen}
        title={
          editingExercise
            ? `Sửa Bài Tập (${getExerciseTypeBadgeLabel(exerciseType)})`
            : exerciseStep === 1
            ? 'Bước 1: Chọn Loại Bài Tập (Exercise Type)'
            : `Bước 2: Thiết Lập Bài Tập (${getExerciseTypeBadgeLabel(exerciseType)})`
        }
        onClose={() => setIsExerciseModalOpen(false)}
        maxWidth="740px"
      >
        {/* STEP 1: PICK EXERCISE TYPE (Only when creating new exercise) */}
        {!editingExercise && exerciseStep === 1 ? (
          <div>
            <p style={{ color: '#475569', marginBottom: '20px' }}>Vui lòng chọn 1 trong 5 loại bài tập để bắt đầu cấu hình:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div
                className="admin-card"
                style={{ padding: '20px', cursor: 'pointer', border: exerciseType === 'multiple_choice' ? '2px solid #2a63e8' : '1px solid #e2e8f0' }}
                onClick={() => handleSelectType('multiple_choice')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔠</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Multiple Choice</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Trắc nghiệm nhiều lựa chọn đáp án, chọn 1 đáp án đúng.</p>
              </div>

              <div
                className="admin-card"
                style={{ padding: '20px', cursor: 'pointer', border: exerciseType === 'listening' ? '2px solid #2a63e8' : '1px solid #e2e8f0' }}
                onClick={() => handleSelectType('listening')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎧</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Listening</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Luyện nghe file audio tiếng Đức và chọn câu trả lời đúng.</p>
              </div>

              <div
                className="admin-card"
                style={{ padding: '20px', cursor: 'pointer', border: exerciseType === 'translation' ? '2px solid #2a63e8' : '1px solid #e2e8f0' }}
                onClick={() => handleSelectType('translation')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌐</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Translation</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Cho câu/từ nguồn, học viên dịch sang ngôn ngữ đích.</p>
              </div>

              <div
                className="admin-card"
                style={{ padding: '20px', cursor: 'pointer', border: exerciseType === 'fill_blank' ? '2px solid #2a63e8' : '1px solid #e2e8f0' }}
                onClick={() => handleSelectType('fill_blank')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✏️</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Fill Blank</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Điền từ còn thiếu vào vị trí gạch chân trong câu.</p>
              </div>

              <div
                className="admin-card"
                style={{ padding: '20px', cursor: 'pointer', border: exerciseType === 'sentence_arrangement' ? '2px solid #2a63e8' : '1px solid #e2e8f0' }}
                onClick={() => handleSelectType('sentence_arrangement')}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🧩</div>
                <h4 style={{ margin: '0 0 4px 0', color: '#0f172a' }}>Sentence Arrangement</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>Sắp xếp các từ rời rạc thành một câu hoàn chỉnh đúng.</p>
              </div>
            </div>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button className="btn-admin-secondary" onClick={() => setIsExerciseModalOpen(false)}>Hủy</button>
            </div>
          </div>
        ) : (
          /* STEP 2: TYPE SPECIFIC BUILDER FORM */
          <form onSubmit={handleSaveExercise}>
            {!editingExercise && (
              <div style={{ marginBottom: '16px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => setExerciseStep(1)}
                >
                  ⬅️ Chọn lại loại bài tập ({getExerciseTypeBadgeLabel(exerciseType)})
                </button>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Từ Vựng Liên Kết (vocabulary)</label>
                <select
                  className="form-select"
                  value={exerciseVocabularyId}
                  onChange={(e) => setExerciseVocabularyId(e.target.value)}
                >
                  <option value="">-- Bài tập tổng hợp (Không chọn từ cụ thể) --</option>
                  {vocabularies.map((v) => (
                    <option key={v._id} value={v.vocabularyId || v._id}>
                      {v.word} ({v.meaning})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Điểm Thưởng (XP)</label>
                <input
                  type="number"
                  className="form-input"
                  min={1}
                  value={exerciseXp}
                  onChange={(e) => setExerciseXp(Number(e.target.value))}
                />
              </div>
            </div>

            {/* TYPE 1: MULTIPLE CHOICE FORM */}
            {exerciseType === 'multiple_choice' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nội Dung Câu Hỏi (Question) *</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Ví dụ: Từ 'der Vater' trong tiếng Việt nghĩa là gì?"
                    value={mcQuestion}
                    onChange={(e) => setMcQuestion(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Các Lựa Chọn Đáp Án (Tích chọn 1 đáp án ĐÚNG) *</label>
                    <button type="button" className="btn-admin-secondary" style={{ fontSize: '0.78rem' }} onClick={handleAddMcOption}>
                      ➕ Add Option
                    </button>
                  </div>

                  {mcOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="option-row">
                      <input
                        type="radio"
                        name="mc_correct_option"
                        className="option-radio"
                        checked={opt.isCorrect}
                        onChange={() =>
                          setMcOptions((prev) =>
                            prev.map((item, idx) => ({ ...item, isCorrect: idx === oIdx })),
                          )
                        }
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Lựa chọn ${oIdx + 1}`}
                        value={opt.text}
                        onChange={(e) =>
                          setMcOptions((prev) =>
                            prev.map((item, idx) => (idx === oIdx ? { ...item, text: e.target.value } : item)),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn-admin-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleRemoveMcOption(oIdx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TYPE 2: LISTENING FORM */}
            {exerciseType === 'listening' && (
              <>
                <div className="form-group">
                  <label className="form-label">Audio URL (Audio file / link phát tiếng Đức) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://example.com/audio/vater.mp3"
                    value={mcAudioUrl}
                    onChange={(e) => setMcAudioUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Yêu Cầu / Câu Hỏi Luyện Nghe</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nghe audio và chọn đáp án chính xác..."
                    value={mcQuestion}
                    onChange={(e) => setMcQuestion(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Các Lựa Chọn Đáp Án (Tích chọn 1 đáp án ĐÚNG) *</label>
                    <button type="button" className="btn-admin-secondary" style={{ fontSize: '0.78rem' }} onClick={handleAddMcOption}>
                      ➕ Add Option
                    </button>
                  </div>

                  {mcOptions.map((opt, oIdx) => (
                    <div key={oIdx} className="option-row">
                      <input
                        type="radio"
                        name="listening_correct_option"
                        className="option-radio"
                        checked={opt.isCorrect}
                        onChange={() =>
                          setMcOptions((prev) =>
                            prev.map((item, idx) => ({ ...item, isCorrect: idx === oIdx })),
                          )
                        }
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Lựa chọn ${oIdx + 1}`}
                        value={opt.text}
                        onChange={(e) =>
                          setMcOptions((prev) =>
                            prev.map((item, idx) => (idx === oIdx ? { ...item, text: e.target.value } : item)),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn-admin-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleRemoveMcOption(oIdx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TYPE 3: TRANSLATION FORM */}
            {exerciseType === 'translation' && (
              <>
                <div className="form-group">
                  <label className="form-label">Câu/Từ Nguồn Cần Dịch (Prompt) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Tôi là học sinh / Hoặc: Guten Tag"
                    value={translationPrompt}
                    onChange={(e) => setTranslationPrompt(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Câu Dịch Chuẩn Đích (Expected Answer) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Ich bin Schüler / Hoặc: Xin chào ban ngày"
                    value={translationExpected}
                    onChange={(e) => setTranslationExpected(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* TYPE 4: FILL BLANK FORM */}
            {exerciseType === 'fill_blank' && (
              <>
                <div className="form-group">
                  <label className="form-label">Câu Chứa Chỗ Trống (Sentence) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Der ___ ist rot. (Dùng dấu ___ làm chỗ trống)"
                    value={fillSentence}
                    onChange={(e) => setFillSentence(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Từ/Cụm Từ Điền Đúng Vụ Trí Trống (Blank Answer) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Apfel"
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            {/* TYPE 5: SENTENCE ARRANGEMENT FORM */}
            {exerciseType === 'sentence_arrangement' && (
              <>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ margin: 0 }}>Các Từ Rời Rạc (Words List) *</label>
                    <button type="button" className="btn-admin-secondary" style={{ fontSize: '0.78rem' }} onClick={handleAddArrangeWord}>
                      ➕ Add Word
                    </button>
                  </div>

                  {arrangeWords.map((word, wIdx) => (
                    <div key={wIdx} className="option-row">
                      <span style={{ fontWeight: 700, color: '#64748b', minWidth: '24px' }}>#{wIdx + 1}</span>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Từ ${wIdx + 1}`}
                        value={word}
                        onChange={(e) =>
                          setArrangeWords((prev) =>
                            prev.map((item, idx) => (idx === wIdx ? e.target.value : item)),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn-admin-secondary"
                        style={{ padding: '6px 8px' }}
                        disabled={wIdx === 0}
                        onClick={() => handleMoveArrangeWord(wIdx, 'left')}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        className="btn-admin-secondary"
                        style={{ padding: '6px 8px' }}
                        disabled={wIdx === arrangeWords.length - 1}
                        onClick={() => handleMoveArrangeWord(wIdx, 'right')}
                      >
                        ▶
                      </button>
                      <button
                        type="button"
                        className="btn-admin-danger"
                        style={{ padding: '6px 10px' }}
                        onClick={() => handleRemoveArrangeWord(wIdx)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Câu Hoàn Chỉnh Đúng (Correct Sentence) *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ví dụ: Ich bin aus Deutschland."
                    value={arrangeCorrectSentence}
                    onChange={(e) => setArrangeCorrectSentence(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Trạng Thái Bài Tập</label>
                <select
                  className="form-select"
                  value={exerciseStatus}
                  onChange={(e) => setExerciseStatus(e.target.value as StatusType)}
                >
                  <option value="active">Active (Hoạt động)</option>
                  <option value="draft">Draft (Bản nháp)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Giải Thích Đáp Án (Explanation)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Giải thích thêm cho đáp án đúng (nếu có)..."
                  value={exerciseExplanation}
                  onChange={(e) => setExerciseExplanation(e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-admin-secondary" onClick={() => setIsExerciseModalOpen(false)}>
                Hủy
              </button>
              <button type="submit" className="btn-admin-primary" disabled={isSavingExercise}>
                {isSavingExercise ? 'Đang lưu...' : editingExercise ? 'Cập Nhật Bài Tập' : 'Tạo Bài Tập'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* View Exercise Modal (Formatted per type) */}
      {viewingExercise && (
        <Modal isOpen={Boolean(viewingExercise)} title="Chi Tiết Bài Tập" onClose={() => setViewingExercise(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <strong>Loại bài tập:</strong>{' '}
              <span className="badge-pill badge-a1">{getExerciseTypeBadgeLabel(viewingExercise.type)}</span>
            </div>

            <div>
              <strong>Yêu cầu / Câu hỏi:</strong>
              <h4 style={{ margin: '6px 0', color: '#0f172a' }}>{viewingExercise.question}</h4>
            </div>

            {/* Type Specific Preview */}
            {viewingExercise.type === 'listening' && viewingExercise.content?.audio_url && (
              <div>
                <strong>Audio Link:</strong>{' '}
                <a href={viewingExercise.content?.audio_url} target="_blank" rel="noreferrer">
                  🔊 {viewingExercise.content?.audio_url}
                </a>
              </div>
            )}

            {(viewingExercise.type === 'multiple_choice' || viewingExercise.type === 'listening') && viewingExercise.options && (
              <div>
                <strong>Các Lựa Chọn Đáp Án:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  {viewingExercise.options.map((opt, i) => (
                    <li key={i} style={{ color: opt.isCorrect ? '#16a34a' : '#475569', fontWeight: opt.isCorrect ? 700 : 400 }}>
                      {opt.text} {opt.isCorrect && ' (ĐÁP ÁN ĐÚNG)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {viewingExercise.type === 'translation' && (
              <div>
                <div><strong>Prompt (Câu nguồn):</strong> {viewingExercise.content?.prompt || viewingExercise.question}</div>
                <div><strong>Expected Answer (Câu dịch):</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{viewingExercise.answer?.expected_answer || 'N/A'}</span></div>
              </div>
            )}

            {viewingExercise.type === 'fill_blank' && (
              <div>
                <div><strong>Sentence:</strong> {viewingExercise.content?.sentence || viewingExercise.question}</div>
                <div><strong>Blank Answer (Từ điền):</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>{viewingExercise.answer?.blank_answer || 'N/A'}</span></div>
              </div>
            )}

            {viewingExercise.type === 'sentence_arrangement' && (
              <div>
                <div>
                  <strong>Các từ rời rạc:</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '6px 0' }}>
                    {(viewingExercise.content?.words || []).map((w, wIdx) => (
                      <span key={wIdx} className="badge-pill badge-a1">{w}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong>Câu ghép hoàn chỉnh đúng:</strong>{' '}
                  <span style={{ color: '#16a34a', fontWeight: 700 }}>{viewingExercise.answer?.correct_sentence || 'N/A'}</span>
                </div>
              </div>
            )}

            <div>
              <strong>Điểm thưởng:</strong> ⚡ {viewingExercise.xp || 5} XP
            </div>

            {viewingExercise.explanation && (
              <div>
                <strong>Giải thích đáp án:</strong> {viewingExercise.explanation}
              </div>
            )}
          </div>

          <div className="form-actions" style={{ marginTop: '20px' }}>
            <button className="btn-admin-secondary" onClick={() => setViewingExercise(null)}>
              Đóng
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Exercise Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteExerciseTarget)}
        title="Xác nhận xóa bài tập"
        message="Bạn có chắc chắn muốn xóa bài tập này khỏi bài học?"
        itemName={deleteExerciseTarget ? deleteExerciseTarget.question : ''}
        isLoading={isDeletingExercise}
        onConfirm={handleDeleteExerciseConfirm}
        onCancel={() => setDeleteExerciseTarget(null)}
      />
    </AdminLayout>
  )
}

export default AdminLessonBuilder
