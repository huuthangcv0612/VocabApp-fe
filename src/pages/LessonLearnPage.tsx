import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { studentLearningService } from '../services/studentLearningService'
import { progressService } from '../services/progressService'
import { aiConversationService } from '../features/ai-conversation/services/aiConversation.service'
import type { LessonDetailData, LessonItem, LessonPreviewVocabulary } from '../types/lesson'
import type { LessonExercise } from '../types/exercise'
import type { LessonLearningStep } from '../types/student'
import { formatSubmitAnswer } from '../utils/exerciseAdapter'
import { toast } from 'react-hot-toast'
import '../styles/pages/lesson.css'

export const LessonLearnPage: React.FC = () => {
  const { lektionId, lessonId } = useParams<{ lektionId?: string; lessonId?: string }>()
  const activeLessonId = lessonId || lektionId
  const navigate = useNavigate()

  const [lessonData, setLessonData] = useState<LessonDetailData | null>(null)
  const [nextLessonData, setNextLessonData] = useState<LessonItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Step flow state: 'intro' -> 'vocab_preview' -> 'exercise' -> 'complete'
  const [step, setStep] = useState<LessonLearningStep>('intro')

  // Vocab preview flashcard index
  const [vocabIndex, setVocabIndex] = useState(0)

  // Exercise mode states
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState<string | number | string[]>('')

  // Word Arrangement token instance state (UI-only IDs)
  interface TokenInstance {
    id: string
    text: string
  }
  const [selectedTokens, setSelectedTokens] = useState<TokenInstance[]>([])
  const [availableTokens, setAvailableTokens] = useState<TokenInstance[]>([])

  // Submission & Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    submitted: boolean
    correct: boolean
    feedback: string
    xp: number
  } | null>(null)

  // Summary statistics
  const [correctCount, setCorrectCount] = useState(0)
  const [totalXpEarned, setTotalXpEarned] = useState(0)
  const [startTime] = useState(Date.now())
  const [isStartingAI, setIsStartingAI] = useState(false)

  const handleStartAIConversation = async () => {
    if (!activeLessonId || isStartingAI) return
    try {
      setIsStartingAI(true)
      const data = await aiConversationService.startConversation(activeLessonId)
      if (data && data.session_id) {
        navigate(`/ai-conversation/${data.session_id}`)
      } else {
        toast.error('Không thể tạo phiên hội thoại AI.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể bắt đầu hội thoại AI.'
      toast.error(msg)
    } finally {
      setIsStartingAI(false)
    }
  }

  useEffect(() => {
    const fetchLesson = async () => {
      if (!activeLessonId) return
      try {
        setLoading(true)
        setError(null)
        const data = await studentLearningService.getLessonLearningData(activeLessonId)
        setLessonData(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải bài học.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [activeLessonId])

  // Reset exercise-specific user input when moving to a new exercise
  useEffect(() => {
    if (!lessonData || step !== 'exercise') return
    const currentEx = lessonData.exercises[exerciseIndex]
    if (!currentEx) return

    setSubmissionResult(null)
    setUserAnswer('')

    if (currentEx.type === 'word_arrangement' || currentEx.type === 'sentence_arrangement') {
      const contentObj = (currentEx.content || {}) as Record<string, unknown>
      const words: string[] = (
        Array.isArray(contentObj.words)
          ? contentObj.words
          : Array.isArray(currentEx.wordTokens)
          ? currentEx.wordTokens
          : []
      ).map((w: unknown) => String(w))

      const tokenInstances: TokenInstance[] = words.map((w, idx) => ({
        id: `tok-${idx}-${w}-${Math.random().toString(36).substring(2, 8)}`,
        text: w,
      }))

      // Shuffle available tokens using Fisher-Yates copy
      const shuffled = [...tokenInstances]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffled[i]
        shuffled[i] = shuffled[j]
        shuffled[j] = temp
      }

      setAvailableTokens(shuffled)
      setSelectedTokens([])
    }
  }, [exerciseIndex, step, lessonData])

  // Audio speech synthesis helper
  const handlePlayAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'de-DE'
      window.speechSynthesis.speak(utterance)
    } else {
      toast.success(`🔊 Audio: ${text}`)
    }
  }

  // --- STEP 1: LESSON INTRO ACTIONS ---
  const handleStartLesson = () => {
    if (!lessonData || !activeLessonId) return

    progressService.startLesson(activeLessonId).catch((err) => {
      console.warn('Start lesson tracking failed:', err)
    })

    if (lessonData.vocabularies.length > 0) {
      setStep('vocab_preview')
      setVocabIndex(0)
    } else if (lessonData.exercises.length > 0) {
      setStep('exercise')
      setExerciseIndex(0)
    } else {
      toast.error('Bài học này chưa có từ vựng hoặc bài tập.')
    }
  }

  const handleNextVocab = () => {
    if (!lessonData) return
    if (vocabIndex < lessonData.vocabularies.length - 1) {
      setVocabIndex((prev) => prev + 1)
    } else {
      if (lessonData.exercises.length > 0) {
        setStep('exercise')
        setExerciseIndex(0)
      } else {
        setStep('complete')
      }
    }
  }

  const handlePrevVocab = () => {
    if (vocabIndex > 0) {
      setVocabIndex((prev) => prev - 1)
    }
  }

  // --- STEP 3: EXERCISE ACTIONS ---
  const handleSelectWordToken = (token: TokenInstance) => {
    if (isSubmitting || submissionResult) return
    setAvailableTokens((prev) => prev.filter((t) => t.id !== token.id))
    setSelectedTokens((prev) => [...prev, token])
  }

  const handleDeselectWordToken = (token: TokenInstance) => {
    if (isSubmitting || submissionResult) return
    setSelectedTokens((prev) => prev.filter((t) => t.id !== token.id))
    setAvailableTokens((prev) => [...prev, token])
  }

  const handleSubmitAnswer = async () => {
    if (!lessonData || !activeLessonId) return
    const currentEx = lessonData.exercises[exerciseIndex]
    if (!currentEx) return

    let finalAnswer: string | number | string[] = userAnswer

    if (currentEx.type === 'word_arrangement' || currentEx.type === 'sentence_arrangement') {
      if (selectedTokens.length === 0) {
        toast.error('Vui lòng chọn các từ để tạo câu.')
        return
      }
      const tokenStrings = selectedTokens.map((t) => t.text)
      if (currentEx.type === 'sentence_arrangement') {
        finalAnswer = tokenStrings.join(' ')
      } else {
        finalAnswer = formatSubmitAnswer(currentEx, tokenStrings)
      }
    } else if (currentEx.type === 'fill_blank') {
      const textAns = typeof userAnswer === 'string' ? userAnswer : String(userAnswer || '')
      if (!textAns.trim()) {
        toast.error('Vui lòng nhập câu trả lời.')
        return
      }
      finalAnswer = formatSubmitAnswer(currentEx, textAns)
    } else if (currentEx.type === 'multiple_choice' || currentEx.type === 'listening') {
      if (typeof userAnswer === 'string') {
        finalAnswer = formatSubmitAnswer(currentEx, userAnswer)
      }
    }

    if (
      (typeof finalAnswer === 'string' && !finalAnswer.trim()) ||
      (Array.isArray(finalAnswer) && finalAnswer.length === 0)
    ) {
      toast.error('Vui lòng chọn các từ để tạo câu.')
      return
    }

    console.log('[DEBUG ExerciseSubmit]', {
      exerciseType: currentEx.type,
      currentExerciseId: currentEx._id,
      question: currentEx.question,
      optionsList: currentEx.optionsList,
      correctAnswer: currentEx.correctAnswer,
      rawAnswerFormat: currentEx.rawAnswerFormat,
      userAnswer,
      formattedSubmitAnswer: finalAnswer,
    })

    try {
      setIsSubmitting(true)
      const res = await studentLearningService.submitExerciseAnswer({
        lessonId: activeLessonId,
        exerciseId: currentEx._id,
        answer: finalAnswer,
      })

      const isCorrect = res.is_correct ?? res.correct ?? false
      const xpEarned = res.xp_earned ?? res.xp ?? 0
      const explanation = res.explanation || res.feedback || ''

      setSubmissionResult({
        submitted: true,
        correct: isCorrect,
        feedback: explanation,
        xp: xpEarned,
      })

      if (isCorrect) {
        setCorrectCount((prev) => prev + 1)
        setTotalXpEarned((prev) => prev + xpEarned)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gửi câu trả lời thất bại.'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContinueAfterExercise = async () => {
    if (!lessonData) return
    if (exerciseIndex < lessonData.exercises.length - 1) {
      setExerciseIndex((prev) => prev + 1)
    } else {
      if (activeLessonId) {
        const res = await studentLearningService.completeLesson(activeLessonId).catch(() => null)
        if (res?.nextLesson) {
          setNextLessonData(res.nextLesson)
        }
      }
      setStep('complete')
    }
  }

  if (loading) {
    return (
      <div className="lesson">
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '60vh' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ fontWeight: 600, color: '#475569' }}>Đang tải bài học...</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !lessonData) {
    return (
      <div className="lesson">
        <Header />
        <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '60vh', color: '#dc2626' }}>
          <p>{error || 'Không thể tải bài học.'}</p>
          <button className="btn-admin-primary" onClick={() => navigate('/learning-path')}>
            Về Lộ Trình Học
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const { lesson, vocabularies, exercises } = lessonData
  const lessonTitle = lesson.title || lesson.lektion_name || 'Lesson'
  const currentVocab: LessonPreviewVocabulary | undefined = vocabularies[vocabIndex]
  const currentExercise: LessonExercise | undefined = exercises[exerciseIndex]

  return (
    <div className="lesson" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '30px 20px', maxWidth: '760px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/learning-path')}
            className="btn-admin-secondary"
            style={{ fontSize: '0.88rem', padding: '6px 16px', borderRadius: '9999px', cursor: 'pointer' }}
          >
            ← Quay lại Lộ Trình Học
          </button>
        </div>
        {step === 'intro' && (
          <div className="admin-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎓</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0' }}>
              {lesson.title || lesson.lektion_name}
            </h1>
            <p style={{ color: '#475569', fontSize: '1rem', marginBottom: '24px', lineHeight: 1.6 }}>
              {lesson.description || 'Chào mừng bạn đến với bài học! Tích lũy từ vựng và tham gia các bài tập tương tác ngay bây giờ.'}
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <div style={{ background: '#e0f2fe', padding: '16px', borderRadius: '16px', color: '#0369a1' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{vocabularies.length}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>📚 Từ Vựng</div>
              </div>

              <div style={{ background: '#fae8ff', padding: '16px', borderRadius: '16px', color: '#86198f' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{exercises.length}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>✍️ Bài Tập</div>
              </div>

              <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '16px', color: '#15803d' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{lesson.estimated_minutes || 15}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>⏱️ Phút Học</div>
              </div>

              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '16px', color: '#b45309' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{lesson.xp || 20}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>⚡ Điểm XP</div>
              </div>
            </div>

            <button
              onClick={handleStartLesson}
              className="btn-admin-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', borderRadius: '9999px', boxShadow: '0 4px 14px rgba(42,99,232,0.35)' }}
            >
              Bắt Đầu Học Ngay ▶
            </button>
          </div>
        )}

        {step === 'vocab_preview' && currentVocab && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.9rem' }}>
                📖 VOCABULARY PREVIEW: <strong>{vocabIndex + 1} / {vocabularies.length}</strong>
              </span>

              {exercises.length > 0 && (
                <button
                  className="btn-admin-secondary"
                  style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                  onClick={() => {
                    setStep('exercise')
                    setExerciseIndex(0)
                  }}
                >
                  Bỏ Qua Preview ➔ Start Exercises
                </button>
              )}
            </div>

            <div
              className="admin-card"
              style={{
                padding: '36px',
                borderRadius: '24px',
                textAlign: 'center',
                boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
                border: '2px solid #e2e8f0',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
                {currentVocab.gender && <span className="badge-pill badge-a1">{currentVocab.gender}</span>}
                <span className={`badge-pill ${currentVocab.is_new !== false ? 'badge-a2' : 'badge-draft'}`}>
                  {currentVocab.is_new !== false ? '✨ Từ Mới' : '🔄 Ôn Tập'}
                </span>
              </div>

              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2a63e8', margin: '0 0 4px 0' }}>
                {currentVocab.word}
              </h2>

              {currentVocab.phonetic && (
                <p style={{ fontSize: '1rem', color: '#94a3b8', margin: '0 0 16px 0', fontFamily: 'monospace' }}>
                  {currentVocab.phonetic}
                </p>
              )}

              <button
                onClick={() => handlePlayAudio(currentVocab.word)}
                className="btn-admin-secondary"
                style={{ borderRadius: '9999px', padding: '8px 20px', marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                🔊 Phát Âm Thanh
              </button>

              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', margin: '0 auto 24px auto', maxWidth: '440px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                  NGHĨA TIẾNG VIỆT
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {currentVocab.meaning}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginTop: '24px' }}>
                <button
                  className="btn-admin-secondary"
                  disabled={vocabIndex === 0}
                  onClick={handlePrevVocab}
                  style={{ flex: 1, padding: '12px' }}
                >
                  ◀ Từ Trước
                </button>

                <button
                  className="btn-admin-primary"
                  onClick={handleNextVocab}
                  style={{ flex: 1, padding: '12px' }}
                >
                  {vocabIndex < vocabularies.length - 1 ? 'Từ Tiếp Theo ▶' : 'Bắt Đầu Làm Bài Tập ✍️'}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'exercise' && currentExercise && (
          <div>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                <span>EXERCISE {exerciseIndex + 1} / {exercises.length}</span>
                <span>⚡ {currentExercise.xp || 5} XP</span>
              </div>
              <div style={{ height: '12px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${Math.round(((exerciseIndex + 1) / exercises.length) * 100)}%`,
                    backgroundColor: '#22c55e',
                    borderRadius: '999px',
                    transition: 'width 0.4s ease',
                  }}
                ></div>
              </div>
            </div>

            <div className="admin-card" style={{ padding: '32px', borderRadius: '24px', position: 'relative' }}>
              <span className="badge-pill badge-a1" style={{ marginBottom: '16px' }}>
                {currentExercise.type}
              </span>

              {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'listening') && (
                <div>
                  {currentExercise.type === 'listening' && (
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                      <button
                        onClick={() => handlePlayAudio(currentExercise.content?.audio_url || currentExercise.question)}
                        className="btn-admin-primary"
                        style={{ padding: '14px 28px', borderRadius: '9999px', fontSize: '1.05rem' }}
                      >
                        🔊 phát âm thanh bài tập
                      </button>
                    </div>
                  )}

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
                    {currentExercise.question}
                  </h3>

                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(currentExercise.optionsList || (currentExercise.options || currentExercise.content?.options || []).map((opt: string | { text: string }) => (typeof opt === 'string' ? opt : opt.text))).map((optText: string, oIdx: number) => {
                      const isSelected = userAnswer === optText || userAnswer === oIdx

                      return (
                        <div
                          key={oIdx}
                          onClick={() => !submissionResult && setUserAnswer(optText)}
                          style={{
                            padding: '16px 20px',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #2a63e8' : '1px solid #cbd5e1',
                            backgroundColor: isSelected ? '#eef2ff' : '#ffffff',
                            cursor: submissionResult ? 'default' : 'pointer',
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? '#2a63e8' : '#1e293b',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {oIdx + 1}. {optText}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {currentExercise.type === 'translation' && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    🌐 Dịch câu sau sang tiếng Đức:
                  </h3>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#2a63e8', marginBottom: '20px', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    "{currentExercise.content?.prompt || currentExercise.question}"
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nhập câu dịch tiếng Đức tại đây..."
                    value={typeof userAnswer === 'string' ? userAnswer : ''}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={Boolean(submissionResult)}
                    style={{ fontSize: '1.05rem', padding: '14px' }}
                  />
                </div>
              )}

              {currentExercise.type === 'fill_blank' && (() => {
                const contentObj = (currentExercise.content || {}) as Record<string, unknown>
                const questionText = (typeof contentObj.question === 'string' && contentObj.question.trim().length > 0 ? contentObj.question : '') || currentExercise.question || (typeof contentObj.sentence === 'string' ? contentObj.sentence : '') || 'Điền từ còn thiếu vào chỗ trống'
                const hintText = currentExercise.hint || (typeof contentObj.hint === 'string' ? contentObj.hint : '') || currentExercise.sentence_translation || (typeof contentObj.sentence_translation === 'string' ? contentObj.sentence_translation : '')

                return (
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                      ✏️ Điền từ còn thiếu vào chỗ trống:
                    </h3>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', background: '#f8fafc', padding: '18px 20px', borderRadius: '16px', border: '1px solid #cbd5e1', lineHeight: 1.5 }}>
                      {questionText}
                    </div>

                    {hintText && (
                      <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#f0f9ff', borderLeft: '4px solid #0284c7', borderRadius: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0369a1', display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                          💡 Gợi ý:
                        </span>
                        <span style={{ fontSize: '1rem', color: '#0c4a6e', fontWeight: 500 }}>
                          {hintText}
                        </span>
                      </div>
                    )}

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nhập câu trả lời..."
                      value={typeof userAnswer === 'string' ? userAnswer : ''}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          if (!isSubmitting && !submissionResult) {
                            handleSubmitAnswer()
                          }
                        }
                      }}
                      disabled={isSubmitting || Boolean(submissionResult)}
                      style={{ fontSize: '1.05rem', padding: '14px', width: '100%', borderRadius: '12px', boxSizing: 'border-box' }}
                      autoFocus
                    />
                  </div>
                )
              })()}

              {(currentExercise.type === 'word_arrangement' || currentExercise.type === 'sentence_arrangement') && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                    🧩 {currentExercise.question || (currentExercise.content?.question as string) || 'Sắp xếp các từ thành câu đúng:'}
                  </h3>

                  <div
                    style={{
                      minHeight: '64px',
                      padding: '16px',
                      border: '2px dashed #cbd5e1',
                      borderRadius: '16px',
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginBottom: '24px',
                      backgroundColor: '#f8fafc',
                      alignItems: 'center',
                    }}
                  >
                    {selectedTokens.length === 0 ? (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        Chạm vào các từ bên dưới để ghép câu...
                      </span>
                    ) : (
                      selectedTokens.map((token) => (
                        <button
                          key={token.id}
                          disabled={isSubmitting || Boolean(submissionResult)}
                          onClick={() => handleDeselectWordToken(token)}
                          className="btn-admin-primary"
                          style={{
                            borderRadius: '12px',
                            padding: '10px 18px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            boxShadow: '0 2px 6px rgba(42,99,232,0.2)',
                            cursor: isSubmitting || submissionResult ? 'default' : 'pointer',
                          }}
                        >
                          {token.text}
                        </button>
                      ))
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {availableTokens.map((token) => (
                      <button
                        key={token.id}
                        disabled={isSubmitting || Boolean(submissionResult)}
                        onClick={() => handleSelectWordToken(token)}
                        className="btn-admin-secondary"
                        style={{
                          borderRadius: '12px',
                          padding: '10px 18px',
                          fontWeight: 700,
                          fontSize: '1rem',
                          backgroundColor: '#ffffff',
                          border: '2px solid #cbd5e1',
                          cursor: isSubmitting || submissionResult ? 'default' : 'pointer',
                        }}
                      >
                        {token.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!submissionResult && (
                <div style={{ marginTop: '32px' }}>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting}
                    className="btn-admin-primary"
                    style={{ width: '100%', padding: '16px', borderRadius: '9999px', fontSize: '1.1rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                  >
                    {isSubmitting ? 'Đang kiểm tra...' : 'Kiểm Tra Đáp Án ✓'}
                  </button>
                </div>
              )}
            </div>

            {submissionResult && (
              <div
                style={{
                  backgroundColor: submissionResult.correct ? '#dcfce7' : '#fee2e2',
                  border: `2px solid ${submissionResult.correct ? '#22c55e' : '#ef4444'}`,
                  borderRadius: '20px',
                  padding: '24px',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ fontSize: '2.5rem' }}>{submissionResult.correct ? '🎉' : '❌'}</div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: submissionResult.correct ? '#15803d' : '#b91c1c' }}>
                      {submissionResult.correct ? '✓ Chính xác!' : '✗ Chưa chính xác'}
                    </h4>
                    <p style={{ margin: 0, color: submissionResult.correct ? '#166534' : '#991b1b', fontSize: '0.92rem' }}>
                      {submissionResult.correct
                        ? `+${submissionResult.xp} XP`
                        : submissionResult.feedback
                        ? submissionResult.feedback
                        : currentExercise.correctAnswer
                        ? `Đáp án đúng là: ${currentExercise.correctAnswer}`
                        : ''}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleContinueAfterExercise}
                  className="btn-admin-primary"
                  style={{
                    backgroundColor: submissionResult.correct ? '#15803d' : '#dc2626',
                    padding: '12px 28px',
                    borderRadius: '9999px',
                  }}
                >
                  Tiếp Tục ➔
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'complete' && (
          <div className="admin-card" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '12px' }}>🏆</div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#15803d', margin: '0 0 8px 0' }}>
              Lesson Complete!
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '32px' }}>
              Chúc mừng bạn đã hoàn thành bài học <strong>{lessonTitle}</strong>!
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '16px',
                marginBottom: '36px',
              }}
            >
              <div style={{ background: '#dcfce7', padding: '20px', borderRadius: '20px', color: '#15803d' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {correctCount} / {exercises.length}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>✓ Câu Trả Lời Đúng</div>
              </div>

              <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '20px', color: '#b45309' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>+{totalXpEarned} XP</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>⚡ Điểm Thưởng</div>
              </div>

              <div style={{ background: '#e0f2fe', padding: '20px', borderRadius: '20px', color: '#0369a1' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {Math.round((Date.now() - startTime) / 1000)}s
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>⏱️ Thời Gian Học</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn-admin-secondary"
                style={{ padding: '14px 24px', borderRadius: '9999px' }}
                onClick={() => navigate('/learning-path')}
              >
                🏠 Quay lại Lộ Trình Học
              </button>

              <button
                className="btn-admin-primary"
                style={{
                  padding: '14px 28px',
                  borderRadius: '9999px',
                  backgroundColor: '#8b5cf6',
                  boxShadow: '0 4px 14px rgba(139,92,246,0.35)',
                }}
                disabled={isStartingAI}
                onClick={handleStartAIConversation}
              >
                {isStartingAI ? '🤖 Đang khởi tạo AI...' : '🤖 Luyện tập với AI'}
              </button>

              <button
                className="btn-admin-primary"
                style={{ padding: '14px 32px', borderRadius: '9999px' }}
                onClick={() => {
                  if (nextLessonData && nextLessonData._id) {
                    navigate(`/learn/lesson/${nextLessonData._id}`)
                  } else {
                    navigate('/learning-path')
                  }
                }}
              >
                Tiếp Tục Khóa Học ➔
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default LessonLearnPage
