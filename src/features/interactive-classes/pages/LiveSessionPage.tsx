import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('interactive')
  const { sessionId = '', lessonId = '', classId = '' } = useParams<{
    sessionId?: string
    lessonId?: string
    classId?: string
  }>()
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

  // Interactive Room Navigation & Learning States
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0)
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false)
  const [score, setScore] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  // Load lesson details helper
  const loadLessonDetails = useCallback(
    async (lId: string) => {
      try {
        const l = await interactiveClassService.getLessonById(lId)
        setLesson(l)

        if (Array.isArray(l.vocabularies)) {
          const vocabs = l.vocabularies.map((v: VocabularyItem | string) =>
            typeof v === 'object'
              ? (v as VocabularyItem)
              : ({ _id: v, word: v, meaning: '' } as VocabularyItem),
          )
          setVocabularyList(vocabs)
        }

        let acts: InteractiveActivity[] = []
        if (Array.isArray(l.activities) && l.activities.length > 0) {
          acts = l.activities
        } else {
          try {
            acts = await interactiveClassService.getActivities(lId)
          } catch {
            acts = []
          }
        }
        setActivities(acts)
        if (acts.length > 0 && !selectedActivityId) {
          setSelectedActivityId(acts[0]._id || acts[0].id || '')
        }
      } catch (err) {
        console.error('Error loading lesson details:', err)
      }
    },
    [selectedActivityId],
  )

  // Fetch session data (or load lesson directly if navigating by lessonId)
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      if (sessionId) {
        const s = await interactiveClassService.getSessionById(sessionId)
        setSession(s)
        if (typeof s.current_item_index === 'number') {
          setCurrentItemIndex(s.current_item_index)
        }
        if (typeof s.show_answer === 'boolean') {
          setIsAnswerRevealed(s.show_answer)
        }

        const lId =
          s.lesson_id ||
          s.interactive_lesson_id ||
          (s as unknown as { lessonId?: string }).lessonId ||
          (s.lesson_info as { _id?: string; id?: string } | undefined)?._id ||
          (s.lesson_info as { _id?: string; id?: string } | undefined)?.id ||
          lessonId ||
          ''

        if (lId) {
          await loadLessonDetails(lId)
          if (s.current_activity_id) {
            setSelectedActivityId(s.current_activity_id)
          }
        }
      } else if (lessonId) {
        await loadLessonDetails(lessonId)
      }
    } catch (err: unknown) {
      console.error('Error fetching room data:', err)
      if (lessonId) {
        await loadLessonDetails(lessonId)
      } else {
        toast.error(t('classes.loadClassError', 'Không tìm thấy thông tin phòng học.'))
        navigate('/interactive-room')
      }
    } finally {
      setLoading(false)
    }
  }, [sessionId, lessonId, loadLessonDetails, navigate, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Effective Class ID for navigation
  const effectiveClassId = useMemo(() => {
    return (
      classId ||
      session?.class_id ||
      session?.classId ||
      (session?.class_info as { _id?: string; id?: string })?._id ||
      (session?.class_info as { _id?: string; id?: string })?.id ||
      lesson?.class_id ||
      lesson?.classId ||
      ''
    )
  }, [classId, session, lesson])

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
    sessionId: sessionId || '',
    isTeacher,
    initialSession: session,
    onSessionUpdated: (updated) => {
      setSession((prev) => ({ ...(prev || {}), ...updated } as InteractiveSession))
      if (typeof updated.current_item_index === 'number') {
        setCurrentItemIndex(updated.current_item_index)
      }
      if (typeof updated.show_answer === 'boolean') {
        setIsAnswerRevealed(updated.show_answer)
      }
    },
    onActivityStarted: (data) => {
      toast(t('interactiveRoom.newActivityStarted'), { icon: '🎯' })
      const actId =
        typeof data.activity_id === 'string'
          ? data.activity_id
          : typeof data.id === 'string'
          ? data.id
          : ''
      if (actId) {
        setSelectedActivityId(actId)
        setCurrentItemIndex(0)
        setIsAnswerRevealed(false)
        setIsCompleted(false)
      }
    },
    onNextItem: (data) => {
      const nextIdx =
        typeof data.index === 'number'
          ? data.index
          : typeof data.current_item_index === 'number'
          ? data.current_item_index
          : currentItemIndex + 1
      setCurrentItemIndex(nextIdx)
      setIsAnswerRevealed(false)
      setIsCompleted(false)
    },
    onShowAnswer: () => {
      setIsAnswerRevealed(true)
    },
    onSessionEnded: () => {
      toast(t('interactiveRoom.sessionEndedToast'), { icon: '🏁' })
    },
  })

  // Current session combined
  const activeSession = liveSession || session

  // Active Activity
  const activeActivity = useMemo(() => {
    return (
      activities.find((a) => (a._id || a.id) === selectedActivityId) ||
      activities[0] ||
      null
    )
  }, [activities, selectedActivityId])

  const currentActivityType: ActivityType =
    activeActivity?.type ||
    (activeSession?.current_activity_type as ActivityType) ||
    'flashcard'

  const totalItems = vocabularyList.length

  // Current Card for Flashcard
  const currentCard: VocabularyItem | null = useMemo(() => {
    if (vocabularyList.length > 0) {
      return vocabularyList[currentItemIndex % vocabularyList.length] || null
    }
    if (activeSession?.current_item && typeof activeSession.current_item === 'object') {
      return activeSession.current_item as VocabularyItem
    }
    return null
  }, [vocabularyList, currentItemIndex, activeSession?.current_item])

  // Current Quiz Question derived from vocabulary
  const currentQuizQuestion = useMemo(() => {
    if (vocabularyList.length === 0) return null
    const vocab = vocabularyList[currentItemIndex % vocabularyList.length]
    if (!vocab) return null

    // Generate 4 choices
    const correctAnswer = vocab.meaning
    const targetId = vocab._id || (vocab as { id?: string }).id
    const otherVocabs = vocabularyList.filter(
      (v) => (v._id || (v as { id?: string }).id) !== targetId,
    )
    const shuffledOthers = [...otherVocabs].sort(() => 0.5 - Math.random())
    const wrongOptions = shuffledOthers.slice(0, 3).map((v) => v.meaning)

    while (wrongOptions.length < 3) {
      wrongOptions.push(`Nghĩa khác ${wrongOptions.length + 1}`)
    }

    const options = [correctAnswer, ...wrongOptions].sort(() => 0.5 - Math.random())

    return {
      questionText: t('interactiveRoom.quiz.questionMeaning', {
        word: vocab.word,
        defaultValue: `Từ "${vocab.word}" có nghĩa là gì?`,
      }),
      word: vocab.word,
      options,
      correctAnswer,
      currentIndex: currentItemIndex,
      totalQuestions: vocabularyList.length,
    }
  }, [vocabularyList, currentItemIndex, t])

  // Teacher Handlers
  const handleTeacherStartActivity = async (activityId: string, type: ActivityType) => {
    try {
      if (sessionId) {
        await interactiveClassService.setSessionActivity(sessionId, activityId)
        emitStartActivity(activityId, type)
      }
      setSelectedActivityId(activityId)
      setCurrentItemIndex(0)
      setIsAnswerRevealed(false)
      setIsCompleted(false)
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
      toast.success(t('interactiveRoom.activityStartedSuccess'))
    } catch (err: unknown) {
      console.error('Error starting activity:', err)
      emitStartActivity(activityId, type)
      setSelectedActivityId(activityId)
      setCurrentItemIndex(0)
      setIsAnswerRevealed(false)
      setIsCompleted(false)
    }
  }

  // Activity Switcher (works for both teacher and self-study student)
  const handleSelectActivity = (activityId: string, type: ActivityType) => {
    if (isTeacher && sessionId) {
      handleTeacherStartActivity(activityId, type)
    } else {
      setSelectedActivityId(activityId)
      setCurrentItemIndex(0)
      setIsAnswerRevealed(false)
      setIsCompleted(false)
    }
  }

  // Unified Next Navigation Handler
  const handleNext = async () => {
    if (currentItemIndex < totalItems - 1) {
      const nextIdx = currentItemIndex + 1
      setCurrentItemIndex(nextIdx)
      setIsAnswerRevealed(false)

      if (isTeacher && sessionId) {
        try {
          await interactiveClassService.nextSessionItem(sessionId)
        } catch (err: unknown) {
          console.error('Error advancing session on server:', err)
        }
        emitNext()
        setLiveSession((prev) => {
          if (!prev) return null
          return {
            ...prev,
            current_item_index: nextIdx,
            show_answer: false,
          }
        })
      }
    } else {
      // Reached the end of this activity -> mark complete!
      setIsCompleted(true)
    }
  }

  const handlePrev = () => {
    if (currentItemIndex > 0) {
      const prevIdx = currentItemIndex - 1
      setCurrentItemIndex(prevIdx)
      setIsAnswerRevealed(false)

      if (isTeacher && sessionId) {
        setLiveSession((prev) => {
          if (!prev) return null
          return {
            ...prev,
            current_item_index: prevIdx,
            show_answer: false,
          }
        })
      }
    }
  }

  const handleToggleAnswer = () => {
    const nextRevealed = !isAnswerRevealed
    setIsAnswerRevealed(nextRevealed)

    if (isTeacher && sessionId) {
      emitShowAnswer()
      setLiveSession((prev) => {
        if (!prev) return null
        return {
          ...prev,
          show_answer: nextRevealed,
        }
      })
    }
  }

  const handleTeacherSpin = async () => {
    try {
      if (sessionId) {
        const res = await interactiveClassService.spinSession(sessionId)
        emitSpin()
        setLiveSession((prev) => {
          if (!prev) return null
          return {
            ...prev,
            spin_result: res.spin_result as InteractiveSession['spin_result'],
          }
        })
      }
    } catch (err: unknown) {
      console.error('Error spinning session:', err)
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
    if (!window.confirm(t('interactiveRoom.endConfirm'))) {
      return
    }

    setEnding(true)
    try {
      if (sessionId) {
        await interactiveClassService.endSession(sessionId)
        emitEndSession()
      }
      toast.success(t('interactiveRoom.sessionEndedToast'))
      navigate(effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room')
    } catch (err: unknown) {
      console.error('Error ending session:', err)
      emitEndSession()
      navigate(effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room')
    } finally {
      setEnding(false)
    }
  }

  // Student Handlers
  const handleStudentSubmitAnswer = async (answer: string) => {
    try {
      if (sessionId) {
        await interactiveClassService.submitResponse(sessionId, { answer })
        emitSubmitAnswer(answer)
      }
    } catch (err: unknown) {
      console.error('Error submitting response:', err)
      if (sessionId) {
        emitSubmitAnswer(answer)
      }
    }
  }

  const handleScoreIncrease = () => {
    setScore((prev) => prev + 1)
  }

  const handleRestart = () => {
    setCurrentItemIndex(0)
    setIsAnswerRevealed(false)
    setScore(0)
    setIsCompleted(false)
  }

  const currentActivityIndex = activities.findIndex(
    (a) => (a._id || a.id) === selectedActivityId,
  )
  const hasMoreActivities =
    currentActivityIndex >= 0 && currentActivityIndex < activities.length - 1

  const handleNextActivity = () => {
    if (hasMoreActivities) {
      const nextAct = activities[currentActivityIndex + 1]
      handleSelectActivity(nextAct._id || nextAct.id || '', nextAct.type)
    } else {
      navigate(effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room')
    }
  }

  if (loading) {
    return (
      <div className="ic-live-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔴</div>
        <h2>{t('interactiveRoom.connecting')}</h2>
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
            {t('interactiveRoom.sessionEndedTitle')}
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '28px' }}>
            {t('interactiveRoom.sessionEndedDesc')}
          </p>
          <button
            type="button"
            className="ic-btn ic-btn-primary"
            style={{ width: '100%' }}
            onClick={() =>
              navigate(
                effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room',
              )
            }
          >
            {t('interactiveRoom.backToClasses')}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#94A3B8', borderColor: '#475569' }}
              onClick={() =>
                navigate(
                  effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room',
                )
              }
            >
              ← {t('classes.backToList', 'Quay về')}
            </button>
            <h2 style={{ margin: 0 }}>
              🔴 {lesson?.title || t('interactiveRoom.title', 'Phòng Học Tương Tác')}
              {lesson?.level && (
                <span style={{ fontSize: '0.8rem', color: '#38BDF8', marginLeft: '8px' }}>
                  ({lesson.level})
                </span>
              )}
            </h2>
          </div>
          <p style={{ margin: '4px 0 0 0' }}>
            {isTeacher ? t('interactiveRoom.teacherMode') : t('interactiveRoom.studentMode')} •{' '}
            {isConnected ? (
              <span style={{ color: '#4ADE80' }}>● {t('interactiveRoom.socketConnected')}</span>
            ) : (
              <span style={{ color: '#94A3B8' }}>● DeutschUp Interactive Room</span>
            )}
          </p>
        </div>

        <div className="ic-live-controls-top">
          {connectedStudents.length > 0 && <ConnectedStudentsBar students={connectedStudents} />}

          {isTeacher && sessionId ? (
            <button
              type="button"
              className="ic-btn ic-btn-danger ic-btn-sm"
              onClick={handleTeacherEndSession}
              disabled={ending}
            >
              {ending ? t('interactiveRoom.ending') : t('interactiveRoom.endSession')}
            </button>
          ) : (
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={() =>
                navigate(
                  effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room',
                )
              }
            >
              {t('interactiveRoom.leaveRoom')}
            </button>
          )}
        </div>
      </header>

      {/* Activity Navigation Bar (Shown whenever activities exist) */}
      {activities.length > 0 && (
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
          <span
            style={{
              fontSize: '0.85rem',
              color: '#94A3B8',
              fontWeight: 700,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {t('interactiveRoom.switchActivity')}
          </span>

          {activities.map((act) => {
            const actId = act._id || act.id || ''
            const isActive =
              selectedActivityId === actId ||
              activeSession?.current_activity_id === actId
            const icon =
              act.type === 'flashcard' ? '🗂️' : act.type === 'quiz' ? '❓' : '🎡'

            return (
              <button
                key={actId}
                type="button"
                className={`ic-btn ic-btn-sm ${isActive ? 'ic-btn-secondary' : 'ic-btn-outline'}`}
                style={{ whiteSpace: 'nowrap' }}
                onClick={() => handleSelectActivity(actId, act.type)}
              >
                {icon} {act.title || act.type}
              </button>
            )
          })}
        </div>
      )}

      {/* Main Interactive Stage */}
      <main className="ic-live-main">
        {/* COMPLETED CELEBRATION SCREEN */}
        {isCompleted ? (
          <div
            style={{
              maxWidth: '640px',
              margin: '30px auto',
              textAlign: 'center',
              padding: '40px 28px',
              background: '#1E293B',
              borderRadius: '28px',
              border: '2px solid #334155',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              color: '#FFFFFF',
            }}
          >
            <div style={{ fontSize: '4.5rem', marginBottom: '16px' }}>🏆</div>
            <h2
              style={{
                fontFamily: 'Oswald',
                fontSize: '2.4rem',
                color: '#FFCC00',
                margin: '0 0 12px',
              }}
            >
              {t('interactiveRoom.completedTitle')}
            </h2>
            <p
              style={{
                color: '#94A3B8',
                fontSize: '1.05rem',
                lineHeight: '1.6',
                marginBottom: '28px',
              }}
            >
              {t('interactiveRoom.completedDesc')}
            </p>

            <div
              style={{
                background: '#0F172A',
                borderRadius: '20px',
                padding: '24px',
                marginBottom: '32px',
                display: 'flex',
                justifyContent: 'space-around',
                border: '1px solid #334155',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {t('interactiveRoom.progress')}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4ADE80' }}>
                  100%
                </div>
              </div>

              {currentActivityType === 'quiz' && (
                <div>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: '#94A3B8',
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                    }}
                  >
                    {t('interactiveRoom.score')}
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38BDF8' }}>
                    {score} / {totalItems}
                  </div>
                </div>
              )}

              <div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: '#94A3B8',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  {t('interactiveRoom.xpEarned', { xp: '' }).trim()}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FACC15' }}>
                  +{Math.max(10, (score || totalItems) * 10)} XP
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="ic-btn ic-btn-outline"
                onClick={handleRestart}
              >
                {t('interactiveRoom.restart')}
              </button>

              {hasMoreActivities && (
                <button
                  type="button"
                  className="ic-btn ic-btn-secondary"
                  onClick={handleNextActivity}
                >
                  {t('interactiveRoom.continueNext')}
                </button>
              )}

              <button
                type="button"
                className="ic-btn ic-btn-primary"
                onClick={() =>
                  navigate(
                    effectiveClassId ? `/interactive-room/classes/${effectiveClassId}` : '/interactive-room',
                  )
                }
              >
                {t('interactiveRoom.backToClass')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ACTIVITY 1: FLASHCARD */}
            {currentActivityType === 'flashcard' &&
              (isTeacher ? (
                <LiveFlashcardTeacher
                  vocabularyList={vocabularyList}
                  currentIndex={currentItemIndex}
                  showAnswer={isAnswerRevealed}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onToggleAnswer={handleToggleAnswer}
                />
              ) : (
                <LiveFlashcardStudent
                  currentCard={currentCard}
                  currentIndex={currentItemIndex}
                  totalCards={totalItems}
                  showAnswer={isAnswerRevealed}
                  onToggleAnswer={handleToggleAnswer}
                />
              ))}

            {/* ACTIVITY 2: QUIZ */}
            {currentActivityType === 'quiz' &&
              (isTeacher ? (
                <LiveQuizTeacher
                  currentQuestion={currentQuizQuestion}
                  showAnswer={isAnswerRevealed}
                  responses={responses}
                  connectedStudents={connectedStudents}
                  onShowAnswer={handleToggleAnswer}
                  onNext={handleNext}
                />
              ) : (
                <LiveQuizStudent
                  currentQuestion={currentQuizQuestion}
                  showAnswer={isAnswerRevealed}
                  onSubmitAnswer={handleStudentSubmitAnswer}
                  onScoreIncrease={handleScoreIncrease}
                />
              ))}

            {/* ACTIVITY 3: SPIN */}
            {currentActivityType === 'spin' &&
              (isTeacher ? (
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
              ))}
          </>
        )}
      </main>

      {/* Live Bottom Bar (Controls & Progress Bar for both Student and Teacher) */}
      {!isCompleted && (
        <footer className="ic-live-bottom-bar">
          {/* Progress Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 600 }}>
              {currentActivityType === 'flashcard'
                ? '🗂️'
                : currentActivityType === 'quiz'
                ? '❓'
                : '🎡'}{' '}
              {t('interactiveRoom.itemProgress', {
                current: Math.min(currentItemIndex + 1, Math.max(1, totalItems)),
                total: totalItems,
              })}
            </div>

            {totalItems > 0 && (
              <div
                style={{
                  width: '120px',
                  height: '8px',
                  backgroundColor: '#334155',
                  borderRadius: '999px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((currentItemIndex + 1) / Math.max(1, totalItems)) * 100),
                    )}%`,
                    height: '100%',
                    backgroundColor: '#2A63E8',
                    borderRadius: '999px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={handlePrev}
              disabled={currentItemIndex <= 0}
            >
              {t('interactiveRoom.prev')}
            </button>

            <button
              type="button"
              className="ic-btn ic-btn-outline ic-btn-sm"
              onClick={handleToggleAnswer}
            >
              👁️{' '}
              {isAnswerRevealed
                ? t('interactiveRoom.answerRevealed')
                : t('interactiveRoom.showAnswer')}
            </button>

            <button
              type="button"
              className="ic-btn ic-btn-primary ic-btn-sm"
              onClick={handleNext}
            >
              {currentItemIndex >= totalItems - 1
                ? t('interactiveRoom.complete')
                : t('interactiveRoom.next')}
            </button>
          </div>
        </footer>
      )}
    </div>
  )
}
