import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import { interactiveClassService } from '../../../services/interactiveClassService'
import type { InteractiveLesson } from '../../../types/interactiveClass'

interface ClassLessonsTabProps {
  classId: string
  isTeacher?: boolean
}

export const ClassLessonsTab = ({ classId, isTeacher = false }: ClassLessonsTabProps) => {
  const { t } = useTranslation('interactive')
  const navigate = useNavigate()
  const [lessons, setLessons] = useState<InteractiveLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [startingSessionId, setStartingSessionId] = useState<string | null>(null)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    try {
      const list = await interactiveClassService.getLessons(classId)
      setLessons(list)
    } catch (err: unknown) {
      console.error('Error fetching interactive lessons:', err)
      toast.error(t('lessons.loadError'))
    } finally {
      setLoading(false)
    }
  }, [classId, t])

  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  const handleDelete = async (lessonId: string, title: string) => {
    if (!window.confirm(t('lessons.deleteConfirm', { title }))) {
      return
    }

    try {
      await interactiveClassService.deleteLesson(lessonId)
      toast.success(t('lessons.deleteSuccess'))
      setLessons((prev) => prev.filter((l) => (l._id || l.id) !== lessonId))
    } catch (err: unknown) {
      console.error('Error deleting lesson:', err)
      toast.error(t('lessons.deleteError'))
    }
  }

  const handleStartSession = async (lessonId: string) => {
    setStartingSessionId(lessonId)
    try {
      if (isTeacher) {
        const session = await interactiveClassService.createSession({
          class_id: classId,
          lesson_id: lessonId,
        })
        toast.success(t('lessons.startSessionSuccess'))
        const sessId = session._id || session.id
        navigate(`/interactive-room/session/${sessId}`)
      } else {
        try {
          const session = await interactiveClassService.createSession({
            class_id: classId,
            lesson_id: lessonId,
          })
          const sessId = session._id || session.id
          if (sessId) {
            navigate(`/interactive-room/session/${sessId}`)
            return
          }
        } catch {
          // If student cannot create session, enter lesson room directly
        }
        navigate(`/interactive-room/classes/${classId}/lessons/${lessonId}`)
      }
    } catch (err: unknown) {
      console.error('Error starting interactive session:', err)
      if (isTeacher) {
        const errorObj = err as { response?: { data?: { message?: string } } }
        toast.error(errorObj?.response?.data?.message || t('lessons.startSessionError'))
      } else {
        navigate(`/interactive-room/classes/${classId}/lessons/${lessonId}`)
      }
    } finally {
      setStartingSessionId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
        <p>{t('lessons.loadingList')}</p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '16px' }}>
      {isTeacher && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button
            type="button"
            className="ic-btn ic-btn-primary"
            onClick={() => navigate(`/interactive-room/classes/${classId}/lessons/new`)}
          >
            {t('lessons.createNew')}
          </button>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="ic-empty-state">
          <div className="ic-empty-icon">📚</div>
          <h3>{t('lessons.emptyTitle')}</h3>
          <p>
            {isTeacher
              ? t('lessons.emptyTeacherDesc')
              : t('lessons.emptyStudentDesc')}
          </p>
          {isTeacher && (
            <button
              type="button"
              className="ic-btn ic-btn-secondary"
              onClick={() => navigate(`/interactive-room/classes/${classId}/lessons/new`)}
            >
              {t('lessons.createNow')}
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {lessons.map((lesson) => {
            const lId = lesson._id || lesson.id || ''
            const vocabCount = (lesson.vocabularies && lesson.vocabularies.length > 0)
              ? lesson.vocabularies.length
              : (lesson.vocabulary_count ?? lesson.vocabularies?.length ?? 0)

            const activityCount = (lesson.activities && lesson.activities.length > 0)
              ? lesson.activities.length
              : (lesson.activity_count ?? lesson.activities?.length ?? 0)

            const isPublished = lesson.status === 'published' || lesson.published === true
            const lessonLang = lesson.language ? lesson.language.toUpperCase() : 'VI'

            return (
              <div
                key={lId}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h4
                      style={{
                        margin: 0,
                        fontFamily: 'Oswald',
                        fontSize: '1.4rem',
                        color: '#0F172A',
                      }}
                    >
                      {lesson.title}
                    </h4>

                    {lesson.level && (
                      <span
                        className="ic-badge"
                        style={{ backgroundColor: '#EFF6FF', color: '#2A63E8' }}
                      >
                        {lesson.level}
                      </span>
                    )}

                    <span
                      className={`ic-badge ${
                        isPublished ? 'ic-badge-active' : 'ic-badge-code'
                      }`}
                    >
                      {isPublished ? t('lessons.published') : t('lessons.draft')}
                    </span>

                    <span
                      className="ic-badge"
                      style={{
                        backgroundColor: '#F1F5F9',
                        color: '#475569',
                        fontWeight: 700,
                      }}
                      title={t('lessons.language')}
                    >
                      🌐 {lessonLang}
                    </span>
                  </div>

                  {lesson.description && (
                    <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '0.95rem' }}>
                      {lesson.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem', color: '#475569' }}>
                    <span>📖 <strong>{vocabCount}</strong> {t('lessons.vocabCount', { count: '' }).trim()}</span>
                    <span>⚡ <strong>{activityCount}</strong> {t('lessons.activityCount', { count: '' }).trim()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {isTeacher && (
                    <>
                      <button
                        type="button"
                        className="ic-btn ic-btn-primary ic-btn-sm"
                        onClick={() => handleStartSession(lId)}
                        disabled={startingSessionId === lId}
                      >
                        {startingSessionId === lId ? t('lessons.starting') : t('lessons.startClass')}
                      </button>

                      <button
                        type="button"
                        className="ic-btn ic-btn-outline ic-btn-sm"
                        onClick={() =>
                          navigate(`/interactive-room/classes/${classId}/lessons/${lId}/edit`)
                        }
                      >
                        {t('lessons.edit')}
                      </button>

                      <button
                        type="button"
                        className="ic-btn ic-btn-outline ic-btn-sm"
                        style={{ color: '#EF4444', borderColor: '#FECACA' }}
                        onClick={() => handleDelete(lId, lesson.title)}
                      >
                        {t('lessons.delete')}
                      </button>
                    </>
                  )}

                  {!isTeacher && (
                    <button
                      type="button"
                      className="ic-btn ic-btn-primary ic-btn-sm"
                      onClick={() => handleStartSession(lId)}
                      disabled={startingSessionId === lId}
                    >
                      {startingSessionId === lId ? t('lessons.starting') : t('lessons.startClass')}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
