import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { lessonApi } from '../services/lessonApi'
import { progressService } from '../services/progressService'
import type { LessonDetailData } from '../types/lesson'
import type { LevelItem } from '../types/level'
import '../styles/pages/lesson.css'

export const Lektion: React.FC = () => {
  const { t } = useTranslation(['learning', 'common'])
  const { lektionId, lessonId } = useParams<{ lektionId?: string; lessonId?: string }>()
  const activeLessonId = lessonId || lektionId || ''
  const navigate = useNavigate()

  const handleStartAndNavigate = async (targetPath: string) => {
    if (activeLessonId) {
      progressService.startLesson(activeLessonId).catch((err) => {
        console.warn('Start lesson tracking failed:', err)
      })
    }
    navigate(targetPath)
  }

  const [lessonData, setLessonData] = useState<LessonDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLesson = async () => {
      if (!activeLessonId) return
      try {
        setLoading(true)
        setError(null)
        const data = await lessonApi.getById(activeLessonId)
        setLessonData(data)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : t('common.states.notFound')
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [activeLessonId, t])

  if (loading) {
    return (
      <div className="lesson" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '80px 20px', minHeight: '60vh' }}>
          <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
          <p style={{ fontWeight: 600, color: '#475569' }}>{t('common.states.loadingData')}</p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !lessonData) {
    return (
      <div className="lesson" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
        <Header />
        <div style={{ textAlign: 'center', padding: '60px 20px', minHeight: '60vh', color: '#dc2626' }}>
          <p>{error || t('common.states.notFound')}</p>
          <button className="btn-admin-primary" onClick={() => navigate('/learning-path')}>
            {t('path.journeyTitle')}
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  const { lesson, vocabularies, exercises } = lessonData
  const lessonTitle = lesson.title || lesson.lektion_name || 'Lesson'
  
  // Extract Topic metadata
  const topicObj = lesson.topic || lesson.topic_id
  const topicName = typeof topicObj === 'object' && topicObj !== null
    ? (topicObj.topic_name || topicObj.name || '')
    : (typeof topicObj === 'string' ? topicObj : '')

  // Extract Level metadata safely
  const lessonRecord = lesson as unknown as Record<string, unknown>
  const unitObj = lesson.unit_id || lesson.unit
  const rawLevelObj = (typeof unitObj === 'object' && unitObj !== null ? (unitObj as unknown as Record<string, unknown>).level_id : undefined) ||
    lessonRecord.level_id ||
    lessonRecord.level
  const levelObj = rawLevelObj as LevelItem | string | undefined

  const levelNameVal = typeof levelObj === 'object' && levelObj !== null
    ? (levelObj.level_name || levelObj.name || '')
    : (typeof levelObj === 'string' ? levelObj : (vocabularies[0]?.level || ''))

  const backToLessonListUrl = '/learning-path'

  return (
    <div className="lesson-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main style={{ flex: 1, padding: '30px 20px', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb / Back button */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', flexWrap: 'wrap' }}>
          <Link to="/learning-path" style={{ color: '#2a63e8', textDecoration: 'none', fontWeight: 600 }}>
            {t('path.journeyTitle')}
          </Link>
          {levelNameVal && (
            <>
              <span style={{ color: '#94a3b8' }}>/</span>
              <Link to={backToLessonListUrl} style={{ color: '#2a63e8', textDecoration: 'none', fontWeight: 600 }}>
                {levelNameVal}
              </Link>
            </>
          )}
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#0f172a', fontWeight: 700 }}>{lessonTitle}</span>
          <span style={{ color: '#94a3b8' }}>/</span>
          <span style={{ color: '#64748b', fontWeight: 600 }}>{t('lektion.breadcrumbExercises')}</span>
        </div>

        {/* Lesson Overview Card */}
        <div
          className="admin-card"
          style={{
            padding: '32px',
            borderRadius: '24px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            {levelNameVal && (
              <span style={{ backgroundColor: '#2a63e8', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700 }}>
                {t('path.levelTag')}: {levelNameVal}
              </span>
            )}
            {topicName && (
              <span style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', padding: '4px 12px', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600 }}>
                🏷️ Topic: {topicName}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 10px 0', color: '#ffffff' }}>
            {lessonTitle}
          </h1>

          <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            {lesson.description || t('path.descFallback', { level: levelNameVal })}
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{vocabularies.length}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📚 {t('lektion.vocab')}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c084fc' }}>{exercises.length}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>✍️ {t('lektion.exercise')}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80' }}>{lesson.estimated_minutes || 15}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>⏱️ {t('lektion.studyTime')}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: '12px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{lesson.xp || 20}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>⚡ {t('lektion.xpPoints')}</div>
            </div>
          </div>
        </div>

        {/* Exercises List Section */}
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
          📝 {t('lektion.exercisesListTitle')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {/* Main Mode 1: Flashcard */}
          <div
            className="admin-card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '2px solid #3b82f6',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => handleStartAndNavigate(`/flashcard/${activeLessonId}`)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🃏</span>
                <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  1
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {t('lektion.flashcardTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {t('lektion.flashcardDesc')}
              </p>
            </div>
            <button className="btn-admin-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px' }}>
              {t('lektion.flashcardBtn')}
            </button>
          </div>

          {/* Main Mode 2: Quiz */}
          <div
            className="admin-card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '2px solid #8b5cf6',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => handleStartAndNavigate(`/quiz/${activeLessonId}`)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>⚡</span>
                <span style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  2
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {t('lektion.quizTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {t('lektion.quizDesc')}
              </p>
            </div>
            <button className="btn-admin-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#8b5cf6' }}>
              {t('lektion.quizBtn')}
            </button>
          </div>

          {/* Main Mode 3: Spin Wheel AI */}
          <div
            className="admin-card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '2px solid #f59e0b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => handleStartAndNavigate(`/spinwheel/${activeLessonId}`)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎡</span>
                <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  3
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {t('lektion.spinTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {t('lektion.spinDesc')}
              </p>
            </div>
            <button className="btn-admin-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#f59e0b' }}>
              {t('lektion.spinBtn')}
            </button>
          </div>

          {/* Main Mode 4: Guided Step-by-Step Lesson Practice */}
          <div
            className="admin-card"
            style={{
              padding: '24px',
              borderRadius: '20px',
              border: '2px solid #10b981',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onClick={() => handleStartAndNavigate(`/learn/lesson/${activeLessonId}`)}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.8rem' }}>🎓</span>
                <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                  4
                </span>
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {t('lektion.guidedTitle')}
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.4 }}>
                {t('lektion.guidedDesc')}
              </p>
            </div>
            <button className="btn-admin-primary" style={{ width: '100%', padding: '12px', borderRadius: '12px', backgroundColor: '#10b981' }}>
              {t('lektion.guidedBtn')}
            </button>
          </div>
        </div>

        {/* Detailed API Exercises List (if lesson has specific items) */}
        {exercises.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              🎯 {t('lektion.exercise')} ({exercises.length})
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {exercises.map((ex, idx) => (
                <div
                  key={ex._id}
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                      {idx + 1} • {ex.type}
                    </span>
                    <h4 style={{ margin: '4px 0 0 0', fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
                      {ex.question}
                    </h4>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>
                    ⚡ +{ex.xp || 5} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Lektion
