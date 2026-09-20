import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../../contexts/AuthContext'
import { useSubscription } from '../../../hooks/useSubscription'
import { checkInteractivePermissions } from '../../../utils/interactivePermissions'
import { interactiveClassService } from '../../../services/interactiveClassService'
import { useInteractiveSessionSocket } from '../../../hooks/useInteractiveSessionSocket'
import type {
  InteractiveSession,
  InteractiveLesson,
  InteractiveActivity,
  ActivityType,
} from '../../../types/interactiveClass'
import type { VocabularyItem } from '../../../types/vocabulary'
import { ConnectedStudentsBar } from '../components/ConnectedStudentsBar'
import { LiveFlashcardTeacher } from '../components/LiveFlashcardTeacher'
import { LiveFlashcardStudent } from '../components/LiveFlashcardStudent'
import { LiveQuizTeacher } from '../components/LiveQuizTeacher'
import { LiveQuizStudent } from '../components/LiveQuizStudent'
import { LiveSpinTeacher } from '../components/LiveSpinTeacher'
import { LiveSpinStudent } from '../components/LiveSpinStudent'
import '../../../styles/pages/interactive-classes.css'

export const LiveSessionPage = () => {
  const { sessionId = '' } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { subscription } = useSubscription()

  const permissions = checkInteractivePermissions(user, subscription)

  const [session, setSession] = useState<InteractiveSession | null>(null)
  const [lesson, setLesson] = useState<InteractiveLesson | null>(null)
  const [vocabularyList, setVocabularyList] = useState<VocabularyItem[]>([])
  const [activities, setActivities] = useState<InteractiveActivity[]>([])
  const [selectedActivityId, setSelectedActivityId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [ending, setEnding] = useState(false)

  // Fetch session data
  const fetchSession = useCallback(async () => {
    if (!sessionId) return
    try {
      const s = await interactiveClassService.getSessionById(sessionId)
      setSession(s)

      const lId = s.lesson_id || (s.lesson_info as { _id?: string } | undefined)?._id
      if (lId) {
        try {
          const l = await interactiveClassService.getLessonById(lId)
          setLesson(l)
          if (Array.isArray(l.vocabularies)) {
            const vocabs = l.vocabularies.map((v: VocabularyItem | string) =>
              typeof v === 'object' ? (v as VocabularyItem) : ({ _id: v, word: v, meaning: '' } as VocabularyItem),
            )
            setVocabularyList(vocabs)
          }
        } catch (err) {
          console.error('Error loading lesson for session:', err)
        }

        try {
          const acts = await interactiveClassService.getActivities(lId)
          setActivities(acts)
          if (acts.length > 0 && !s.current_activity_id) {
            setSelectedActivityId(acts[0]._id || acts[0].id || '')
          }
        } catch (err) {
          console.error('Error loading activities for session:', err)
        }
      }
    } catch (err: unknown) {
      console.error('Error fetching session:', err)
      toast.error('Không tìm thấy thông tin phòng học trực tiếp.')
      navigate('/interactive-room')
    } finally {
      setLoading(false)
    }
  }, [sessionId, navigate])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Determine if this user is the teacher / host of this session
  const isTeacher = useMemo(() => {
    if (!user) return false
    if (user.role === 'admin') return true
    if (!permissions.canManageClasses && !permissions.canStartLiveSession) return false

    const classInfo = session?.class_info as Record<string, unknown> | undefined
    const teacherId =
      (typeof classInfo?.teacher_id === 'object' && classInfo.teacher_id !== null
        ? (classInfo.teacher_id as { _id?: string })._id
        : (classInfo?.teacher_id as string)) || ''
    const createdBy =
      (classInfo?.created_by as string) ||
      (session as unknown as { host_id?: string })?.host_id ||
      ''

    const isOwner = Boolean(
      (user._id && (teacherId === user._id || createdBy === user._id)) ||
      (user.id && (teacherId === user.id || createdBy === user.id)),
    )

    return isOwner && (permissions.canManageClasses || permissions.canStartLiveSession)
  }, [user, permissions, session])

  // Real-time socket integration
  const {
    isConnected,
    liveSession,
    setLiveSession,
    connectedStudents,
    responses,
    emitStartActivity,
    emitNext,
    emitShowAnswer,
    emitSpin,
    emitSubmitAnswer,
    emitEndSession,
  } = useInteractiveSessionSocket({
    sessionId,
    isTeacher,
    initialSession: session,
    onSessionUpdated: (updated) => {
      setSession((prev) => ({ ...(prev || {}), ...updated } as InteractiveSession))
    },
    onActivityStarted: (data) => {
      toast('Hoạt động mới đã bắt đầu!', { icon: '🎯' })
      const actId = typeof data.activity_id === 'string' ? data.activity_id : typeof data.id === 'string' ? data.id : ''
      if (actId) setSelectedActivityId(actId)
    },
    onSessionEnded: () => {
      toast('Buổi học đã kết thúc!', { icon: '🏁' })
    },
  })

  // Current session combined from REST and live Socket updates
  const activeSession = liveSession || session
  const currentActivityType: ActivityType =
    (activeSession?.current_activity_type as ActivityType) ||
    activities.find((a) => (a._id || a.id) === activeSession?.current_activity_id)?.type ||
    'flashcard'

  const currentItemIndex = activeSession?.current_item_index || 0
  const isAnswerRevealed = Boolean(activeSession?.show_answer)

  // Current Card for Flashcard
  const currentCard: VocabularyItem | null = useMemo(() => {
    if (activeSession?.current_item && typeof activeSession.current_item === 'object') {
      return activeSession.current_item as VocabularyItem
    }
    if (vocabularyList.length > 0) {
      return vocabularyList[currentItemIndex % vocabularyList.length] || null
    }
    return null
  }, [activeSession?.current_item, vocabularyList, currentItemIndex])

  // Current Quiz Question derived from vocabulary
  const currentQuizQuestion = useMemo(() => {
    if (vocabularyList.length === 0) return null
    const vocab = vocabularyList[currentItemIndex % vocabularyList.length]
    if (!vocab) return null

    // Generate 4 choices
    const correctAnswer = vocab.meaning
    const targetId = vocab._id || (vocab as { id?: string }).id
    const otherVocabs = vocabularyList.filter((v) => (v._id || (v as { id?: string }).id) !== targetId)
    const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random())
    const wrongOptions = shuffledOthers.slice(0, 3).map((v) => v.meaning)

    // Fill with placeholders if less than 3 other vocabs
    while (wrongOptions.length < 3) {
      wrongOptions.push(`Nghĩa khác ${wrongOptions.length + 1}`)
    }

    const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random())

    return {
      questionText: `Từ "${vocab.word}" có nghĩa là gì?`,
      word: vocab.word,
      options,
      correctAnswer,
      currentIndex: currentItemIndex,
      totalQuestions: vocabularyList.length,
    }
  }, [vocabularyList, currentItemIndex])

  // Teacher Handlers
  const handleTeacherStartActivity = async (activityId: string, type: ActivityType) => {
    try {
      await interactiveClassService.setSessionActivity(sessionId, activityId)
      emitStartActivity(activityId, type)
      setSelectedActivityId(activityId)
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          current_activity_id: activityId,
          current_activity_type: type,
          current_item_index: 0,
          show_answer: false,
        }
      })
      toast.success('Đã bắt đầu hoạt động mới!')
    } catch (err: unknown) {
      console.error('Error starting activity:', err)
      emitStartActivity(activityId, type)
    }
  }

  const handleTeacherNext = async () => {
    try {
      await interactiveClassService.nextSessionItem(sessionId)
      emitNext()
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          current_item_index: (prev.current_item_index || 0) + 1,
          show_answer: false,
        }
      })
    } catch (err: unknown) {
      console.error('Error advancing session:', err)
      emitNext()
    }
  }

  const handleTeacherShowAnswer = () => {
    emitShowAnswer()
    setLiveSession((prev) => {
      if (!prev) return null
      return {
        ...prev,
        show_answer: true,
      }
    })
  }

  const handleTeacherSpin = async () => {
    try {
      const res = await interactiveClassService.spinSession(sessionId)
      emitSpin()
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          spin_result: res.spin_result as InteractiveSession['spin_result'],
        }
      })
    } catch (err: unknown) {
      console.error('Error spinning session:', err)
      // Fallback: pick random word locally and emit
      if (vocabularyList.length > 0) {
        const randomWord = vocabularyList[Math.floor(Math.random() * vocabularyList.length)]
        emitSpin()
        setLiveSession((prev) => {
          if (!prev) return null
          return { ...prev, spin_result: randomWord }
        })
      }
    }
  }

  const handleTeacherEndSession = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn kết thúc buổi học Live này?')) {
      return
    }

    setEnding(true)
    try {
      await interactiveClassService.endSession(sessionId)
      emitEndSession()
      toast.success('Đã kết thúc buổi học!')
      navigate('/interactive-room')
    } catch (err: unknown) {
      console.error('Error ending session:', err)
      emitEndSession()
      navigate('/interactive-room')
    } finally {
      setEnding(false)
    }
  }

  // Student Handlers
  const handleStudentSubmitAnswer = async (answer: string) => {
    try {
      await interactiveClassService.submitResponse(sessionId, { answer })
      emitSubmitAnswer(answer)
    } catch (err: unknown) {
      console.error('Error submitting response:', err)
      emitSubmitAnswer(answer)
    }
  }

  if (loading) {
    return (
      <div className="ic-live-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔴</div>
        <h2>Đang kết nối vào phòng học trực tiếp...</h2>
      </div>
    )
  }

  // Session Ended Screen
  if (activeSession?.status === 'ended') {
    return (
      <div className="ic-live-page" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div
          style={{
            background: '#1E293B',
            borderRadius: '28px',
            padding: '48px 36px',
            textAlign: 'center',
            maxWidth: '520px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '2px solid #334155',
          }}
        >
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏁</div>
          <h2 style={{ fontFamily: 'Oswald', fontSize: '2.2rem', color: '#FFFFFF', margin: '0 0 12px' }}>
            Buổi Học Đã Kết Thúc
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '28px' }}>
            Cảm ơn bạn đã tham gia buổi học trực tiếp cùng lớp! Hãy tiếp tục luyện tập từ vựng mỗi ngày.
          </p>
          <button
            type="button"
            className="ic-btn ic-btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate('/interactive-room')}
          >
            Quay lại Lớp học
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ic-live-page">
      {/* Live Top Header */}
      <header className="ic-live-header">
        <div className="ic-live-title-box">
          <h2>
            🔴 {lesson?.title || 'Phòng Học Trực Tiếp'}
            {lesson?.level && (
              <span style={{ fontSize: '0.8rem', color: '#38BDF8', marginLeft: '8px' }}>
                ({lesson.level})
              </span>
            )}
          </h2>
          <p>
            {isTeacher ? 'Chế độ Giáo Viên (Teacher Control)' : 'Chế độ Học Viên (Student View)'} •{' '}
            {isConnected ? (
              <span style={{ color: '#4ADE80' }}>● Socket Kết nối thời gian thực</span>
            ) : (
              <span style={{ color: '#FACC15' }}>● Đang kết nối lại...</span>
            )}
          </p>
        </div>

        <div className="ic-live-controls-top">
          <ConnectedStudentsBar students={connectedStudents} />

          {isTeacher ? (
            <button
              type="button"
              className="ic-btn ic-btn-danger ic-btn-sm"
              onClick={handleTeacherEndSession}
              disabled={ending}
            >
              {ending ? 'Đang kết thúc...' : '🛑 Kết thúc buổi học'}
            </button>
          ) : (
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={() => navigate('/interactive-room')}
            >
              Rời phòng
            </button>
          )}
        </div>
      </header>

      {/* Teacher Activity Navigation Bar */}
      {isTeacher && activities.length > 0 && (
        <div
          style={{
            backgroundColor: '#1E293B',
            borderBottom: '1px solid #334155',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            overflowX: 'auto',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            CHUYỂN HOẠT ĐỘNG:
          </span>

          {activities.map((act) => {
            const actId = act._id || act.id || ''
            const isActive = selectedActivityId === actId || activeSession?.current_activity_id === actId
            const icon = act.type === 'flashcard' ? '🗂️' : act.type === 'quiz' ? '❓' : '🎡'

            return (
              <button
                key={actId}
                type="button"
                className={`ic-btn ic-btn-sm ${isActive ? 'ic-btn-secondary' : 'ic-btn-outline'}`}
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => handleTeacherStartActivity(actId, act.type)}
              >
                {icon} {act.title || act.type}
              </button>
            )
          })}
        </div>
      )}

      {/* Main Interactive Stage */}
      <main className="ic-live-main">
        {/* ACTIVITY 1: FLASHCARD */}
        {currentActivityType === 'flashcard' && (
          isTeacher ? (
            <LiveFlashcardTeacher
              vocabularyList={vocabularyList}
              currentIndex={currentItemIndex}
              showAnswer={isAnswerRevealed}
              onNext={handleTeacherNext}
              onPrev={() => {
                setLiveSession((prev) => {
                  if (!prev) return null
                  return {
                    ...prev,
                    current_item_index: Math.max(0, (prev.current_item_index || 0) - 1),
                    show_answer: false,
                  }
                })
              }}
              onToggleAnswer={handleTeacherShowAnswer}
            />
          ) : (
            <LiveFlashcardStudent
              currentCard={currentCard}
              currentIndex={currentItemIndex}
              totalCards={vocabularyList.length}
              showAnswer={isAnswerRevealed}
            />
          )
        )}

        {/* ACTIVITY 2: QUIZ */}
        {currentActivityType === 'quiz' && (
          isTeacher ? (
            <LiveQuizTeacher
              currentQuestion={currentQuizQuestion}
              showAnswer={isAnswerRevealed}
              responses={responses}
              connectedStudents={connectedStudents}
              onShowAnswer={handleTeacherShowAnswer}
              onNext={handleTeacherNext}
            />
          ) : (
            <LiveQuizStudent
              currentQuestion={currentQuizQuestion}
              showAnswer={isAnswerRevealed}
              onSubmitAnswer={handleStudentSubmitAnswer}
            />
          )
        )}

        {/* ACTIVITY 3: SPIN */}
        {currentActivityType === 'spin' && (
          isTeacher ? (
            <LiveSpinTeacher
              vocabularyList={vocabularyList}
              spinResult={activeSession?.spin_result}
              onSpin={handleTeacherSpin}
            />
          ) : (
            <LiveSpinStudent
              vocabularyList={vocabularyList}
              spinResult={activeSession?.spin_result}
            />
          )
        )}
      </main>

      {/* Live Bottom Bar (Teacher Quick Controls or Student Info) */}
      <footer className="ic-live-bottom-bar">
        <div style={{ color: '#94A3B8', fontSize: '0.85rem' }}>
          Đồng bộ thời gian thực qua <strong>Socket.IO</strong> • DeutschUp Interactive Room
        </div>

        {isTeacher ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={handleTeacherShowAnswer}
            >
              👁️ {isAnswerRevealed ? 'Đáp án đang mở' : 'Hiện đáp án'}
            </button>
            <button
              type="button"
              className="ic-btn ic-btn-primary ic-btn-sm"
              onClick={handleTeacherNext}
            >
              Tiếp theo ➔
            </button>
          </div>
        ) : (
          <div style={{ color: '#E2E8F0', fontSize: '0.9rem' }}>
            Đang tham gia cùng <strong>{connectedStudents.length}</strong> học viên
          </div>
        )}
      </footer>
    </div>
  )
}
