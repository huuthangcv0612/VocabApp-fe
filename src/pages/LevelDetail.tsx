import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useLektions, useLevels, useUnits } from '../hooks/useApi'
import type { LektionWithProgress } from '../services/api'
import CloudIcon from '../assets/Cloud.svg'
import GirlIcon from '../assets/Girl 1.svg'
import '../styles/pages/levels.css'

const LevelDetail = () => {
  const { levelId, topicId } = useParams<{ levelId: string; topicId?: string }>()
  const navigate = useNavigate()
  const { levels } = useLevels()

  // Find level object by _id or level_name
  const levelObj = useMemo(() => {
    if (!levelId) return null
    return levels.find((item) => item._id === levelId || item.level_name === levelId)
  }, [levels, levelId])

  const resolvedLevelId = levelObj?._id || levelId || ''
  const levelName = levelObj ? levelObj.level_name : levelId || 'A1.1'

  // Fetch units for topic if topicId is provided
  const { units, loading: unitsLoading, error: unitsError } = useUnits(topicId)

  // Fetch all lektions for this level/topic directly as fallback
  const { lektions: rawLektions, loading: lektionsLoading, error: lektionsError } = useLektions(resolvedLevelId)

  const displayLektions: LektionWithProgress[] = useMemo(() => {
    return rawLektions || []
  }, [rawLektions])

  return (
    <div className="lektion-page">
      <Header />

      {/* Section 1: Hero Banner (CHOOSE LEKTION) */}
      <section className="lektion-hero-section">
        {/* Floating Clouds */}
        <img src={CloudIcon} alt="" className="hero-cloud cloud-1" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-2" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-3" />

        <div className="lektion-hero-container">
          <div className="lektion-hero-title-wrapper">
            <h1 className="lektion-hero-title">
              LEVEL {levelName}<br />LESSONS
            </h1>
          </div>

          <div className="lektion-hero-girl-wrapper">
            <img src={GirlIcon} alt="Girl on surfboard" className="lektion-hero-girl-img" />
          </div>
        </div>

        {/* Bottom Scalloped Wave */}
        <div className="lektion-hero-wave"></div>
      </section>

      {/* Section 2: Lesson Selection Grid */}
      <section className="lektion-selection-section">
        <div className="lektion-container">
          {/* Breadcrumb / Back button */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem' }}>
            <Link to="/levels" className="back-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              ← Levels
            </Link>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>/</span>
            <Link to={`/topics/${resolvedLevelId}`} style={{ color: '#ffffff', fontWeight: 600, textDecoration: 'none' }}>
              {levelName}
            </Link>
            {topicId && (
              <>
                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>/</span>
                <span style={{ color: '#ffffff', fontWeight: 700 }}>Topic Units</span>
              </>
            )}
          </div>

          {topicId && units.length > 0 ? (
            <>
              <h2 className="lektion-section-title">CHỌN UNIT HỌC ({levelName})</h2>
              {unitsLoading && <p className="status-text white-text">Đang tải danh sách Units...</p>}
              {unitsError && <p className="status-text error">Lỗi tải Units: {unitsError}</p>}
              <div className="lektion-cards-grid">
                {units.map((u, idx) => {
                  const title = u.unit_name || u.name || `Unit ${idx + 1}`
                  return (
                    <div
                      key={u._id}
                      className="lektion-card-item"
                      onClick={() => navigate(`/unit/${u._id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="lektion-card-image-wrapper">
                        <span className="lektion-card-icon-lg">📦</span>
                      </div>
                      <div className="lektion-card-content">
                        <h3 className="lektion-card-name">{title}</h3>
                        {u.description && (
                          <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#cbd5e1' }}>
                            {u.description}
                          </p>
                        )}
                        <p className="lektion-card-desc">▶ Xem bài học trong Unit này</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <h2 className="lektion-section-title">CHỌN BÀI HỌC ({levelName})</h2>

              {lektionsLoading && <p className="status-text white-text">Đang tải danh sách bài học...</p>}
              {lektionsError && <p className="status-text error">Lỗi: {lektionsError}</p>}

              {!lektionsLoading && displayLektions.length === 0 && (
                <p className="status-text white-text">
                  Chưa có bài học nào trong trình độ {levelName}.
                </p>
              )}

              {/* Lektion Cards Grid */}
              <div className="lektion-cards-grid">
                {displayLektions.map((lektion) => {
                  const displayTitle = lektion.lektion_name.includes('-')
                    ? lektion.lektion_name.split('-').pop()?.trim() || lektion.lektion_name
                    : lektion.lektion_name

                  // Extract Topic metadata (Topic is metadata only, not a navigation button)
                  const topicVal = lektion.topic
                  const topicName = typeof topicVal === 'object' && topicVal !== null
                    ? (topicVal.topic_name || topicVal.name || '')
                    : (typeof topicVal === 'string' ? topicVal : '')

                  const count = typeof lektion.vocabularyCount === 'number' ? lektion.vocabularyCount : 0
                  const progress = lektion.progress || { status: 'not_started', percentage: 0, learnedWordsCount: 0 }
                  const isCompleted = progress.status === 'completed' || progress.percentage === 100

                  return (
                    <div
                      key={lektion._id}
                      className="lektion-card-item"
                      onClick={() => navigate(`/lessons/${lektion._id}`)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="lektion-card-image-wrapper">
                        <span className="lektion-card-icon-lg">📚</span>
                      </div>

                      <div className="lektion-card-content">
                        <h3 className="lektion-card-name">{displayTitle}</h3>
                        
                        {topicName && (
                          <p style={{ margin: '4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                            🏷️ Topic: {topicName}
                          </p>
                        )}

                        {lektion.description && (
                          <p style={{ margin: '2px 0 6px 0', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                            {lektion.description}
                          </p>
                        )}

                        <p className="lektion-card-desc">
                          📖 {count} từ vựng • {isCompleted ? '✓ Hoàn thành' : progress.percentage > 0 ? `⏳ Đang học (${progress.percentage}%)` : '░ Chưa học'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Bottom Scalloped Wave before Footer */}
        <div className="lektion-bottom-wave"></div>
      </section>

      <Footer />
    </div>
  )
}

export default LevelDetail