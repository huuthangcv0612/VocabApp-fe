import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { studentLearningService } from '../services/studentLearningService'
import { progressService } from '../services/progressService'
import type { UnitLearningData } from '../types/student'
import type { UserProgressData } from '../types/progress'
import '../styles/pages/lesson.css'

export const UnitPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>()
  const navigate = useNavigate()

  const [unitData, setUnitData] = useState<UnitLearningData | null>(null)
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, { status: string; progress: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUnitAndProgress = async () => {
      if (!unitId) return
      try {
        setLoading(true)
        setError(null)
        const [data, userProgress] = await Promise.all([
          studentLearningService.getUnitLessons(unitId),
          progressService.getUserProgressOverview().catch(() => null as UserProgressData | null),
        ])

        const map: Record<string, { status: string; progress: number }> = {}
        if (userProgress && Array.isArray(userProgress.lektionProgresses)) {
          userProgress.lektionProgresses.forEach((p) => {
            map[p.lektionId] = { status: p.status, progress: p.progress }
          })
        }

        setUnitData(data)
        setLessonProgressMap(map)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải thông tin Unit.'
        setError(msg)
      } finally {
        setLoading(false)
      }
    }
    fetchUnitAndProgress()
  }, [unitId])

  return (
    <div className="lesson">
      <Header />
      <section className="lesson-section" style={{ minHeight: '80vh', padding: '40px 20px' }}>
        <div className="lesson-container">
          <Link to="/levels" className="back-button" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span>←</span>
            <span>Trở về Khóa Học</span>
          </Link>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="admin-spinner" style={{ margin: '0 auto 16px auto' }}></div>
              <p>Đang tải danh sách bài học và tiến độ...</p>
            </div>
          ) : error || !unitData ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#dc2626' }}>
              <p>{error || 'Không tìm thấy dữ liệu Unit.'}</p>
            </div>
          ) : (
            <>
              {/* Unit Header Card */}
              <div className="admin-card" style={{ marginBottom: '32px', padding: '32px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                  <span className="badge-pill badge-a1">{unitData.levelName || 'Level A1'}</span>
                  <span className="badge-pill badge-a2">{unitData.topicName || 'Chủ Đề'}</span>
                </div>
                <h1 className="lesson-title" style={{ margin: '0 0 12px 0', fontSize: '2rem', textAlign: 'left' }}>
                  {unitData.unitName}
                </h1>
                <p className="lesson-description" style={{ textAlign: 'left', margin: 0 }}>
                  {unitData.description || 'Hoàn thành các bài học bên dưới để tích lũy từ vựng và điểm thưởng XP.'}
                </p>
              </div>

              {/* Lessons List Grid */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
                📖 Danh Sách Bài Học (Lessons in Unit)
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {unitData.lessons.map((les, idx) => {
                  const pItem = lessonProgressMap[les._id]
                  const realStatus = pItem ? pItem.status : les.status
                  const progressPct = pItem ? pItem.progress : (realStatus === 'completed' ? 100 : 0)

                  const isLocked = realStatus === 'locked'
                  const isCompleted = realStatus === 'completed'
                  const isInProgress = realStatus === 'in_progress' || (progressPct > 0 && progressPct < 100)

                  return (
                    <div
                      key={les._id}
                      className="tool-card"
                      style={{
                        padding: '24px',
                        borderRadius: '20px',
                        border: isCompleted ? '2px solid #22c55e' : isInProgress ? '2px solid #eab308' : isLocked ? '1px solid #e2e8f0' : '2px solid #2a63e8',
                        opacity: isLocked ? 0.6 : 1,
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => {
                        if (!isLocked) {
                          navigate(`/learn/lesson/${les._id}`)
                        }
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>
                            LESSON {idx + 1}
                          </span>
                          <span
                            className={`badge-pill ${
                              isCompleted ? 'badge-active' : isInProgress ? 'badge-b1' : isLocked ? 'badge-inactive' : 'badge-a2'
                            }`}
                          >
                            {isCompleted
                              ? '✓ Completed'
                              : isInProgress
                              ? `⏳ ${progressPct}% In Progress`
                              : isLocked
                              ? '🔒 Locked'
                              : '▶ Available'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                          {les.title}
                        </h3>

                        {les.description && (
                          <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 16px 0' }}>
                            {les.description}
                          </p>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                          <span>⏱️ {les.estimated_minutes || 15} phút</span>
                          <span>•</span>
                          <span>⚡ {les.xp || 20} XP</span>
                        </div>

                        <button
                          className="tool-button"
                          disabled={isLocked}
                          style={{
                            width: '100%',
                            backgroundColor: isCompleted ? '#16a34a' : isInProgress ? '#ca8a04' : isLocked ? '#cbd5e1' : '#2a63e8',
                          }}
                        >
                          {isCompleted ? 'Học Lại Bài Này' : isInProgress ? `Tiếp Tục (${progressPct}%)` : isLocked ? 'Chưa Mở Khóa' : 'Bắt Đầu Học ▶'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </section>
      <Footer />
    </div>
  )
}

export default UnitPage
