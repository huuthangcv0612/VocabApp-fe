import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTopics, useTopicLektions, useLektions, useLevels } from '../hooks/useApi'
import type { Topic, LektionWithProgress } from '../services/api'
import '../styles/pages/levels.css'
import '../styles/components/topic-card.css'

const TOPIC_ICONS: Record<string, string> = {
  Familie: '👨‍👩‍👧',
  Gesundheit: '🏥',
  Arbeit: '💼',
  Alltag: '🏠',
  Einkaufen: '🛍️',
  Reisen: '✈️',
  Wohnen: '🛋️',
  Essen: '🍕',
  Lernen: '📚',
  Freizeit: '⚽',
  Kultur: '🎭',
  Natur: '🌿',
}

const getTopicIcon = (topicName?: string, icon?: string): string => {
  if (icon) return icon
  if (!topicName || typeof topicName !== 'string') return '📘'
  const lowerName = topicName.toLowerCase()
  for (const key of Object.keys(TOPIC_ICONS)) {
    if (lowerName.includes(key.toLowerCase())) {
      return TOPIC_ICONS[key]
    }
  }
  return '📘'
}

const LevelDetail = () => {
  const { levelId, topicId } = useParams<{ levelId: string; topicId?: string }>()
  const navigate = useNavigate()
  const { levels } = useLevels()
  const { topics, loading: topicsLoading, error: topicsError } = useTopics(levelId)
  const { lektions: allLektions, loading: allLektionsLoading } = useLektions(levelId)

  // Find level object
  const level = levels.find((item) => item._id === levelId || item.level_name === levelId)
  const levelName = level ? level.level_name : levelId || 'A1.1'

  // Extract unique topics from allLektions if backend topics endpoint returns empty
  const fallbackTopics = useMemo(() => {
    if (topics.length > 0) return []
    const map = new Map<string, Topic>()
    allLektions.forEach((l) => {
      const topicVal = l.topic
      if (typeof topicVal === 'string' && topicVal) {
        if (!map.has(topicVal)) {
          map.set(topicVal, { _id: topicVal, topic_name: topicVal })
        }
      } else if (topicVal && typeof topicVal === 'object' && topicVal.topic_name) {
        if (!map.has(topicVal._id)) {
          map.set(topicVal._id, topicVal)
        }
      }
    })
    return Array.from(map.values())
  }, [topics, allLektions])

  const effectiveTopics = topics.length > 0 ? topics : fallbackTopics

  // Selected topic resolution
  const activeTopic = useMemo(() => {
    if (!topicId) return null
    return effectiveTopics.find((t) => t._id === topicId || t.topic_name === topicId) || {
      _id: topicId,
      topic_name: topicId,
    }
  }, [topicId, effectiveTopics])

  // Fetch lektions for selected topic
  const { lektions: topicLektions, loading: lektionsLoading, error: lektionsError } = useTopicLektions(
    activeTopic?._id,
    levelId
  )

  // Fallback for lektions if API returned empty
  const displayLektions: LektionWithProgress[] = useMemo(() => {
    if (topicLektions.length > 0) return topicLektions
    if (!activeTopic) return []
    return allLektions.filter((l) => {
      if (typeof l.topic === 'string') return l.topic === activeTopic._id || l.topic === activeTopic.topic_name
      if (l.topic && typeof l.topic === 'object') return l.topic._id === activeTopic._id || l.topic.topic_name === activeTopic.topic_name
      return false
    })
  }, [topicLektions, allLektions, activeTopic])

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          {/* Header & Breadcrumb */}
          <div className="topic-header-bar">
            {activeTopic ? (
              <button className="back-link" onClick={() => navigate(`/levels/${levelId}`)}>
                ← Các chủ đề ({levelName})
              </button>
            ) : (
              <Link to="/levels" className="back-link">
                ← Chọn Trình Độ khác
              </Link>
            )}
          </div>

          {!activeTopic ? (
            /* BƯỚC 1: HỌC THEO CHỦ ĐỀ (TOPIC LIST) */
            <>
              <h1 className="levels-title">Các chủ đề — {levelName}</h1>
              <p className="levels-description">
                Chọn một chủ đề bên dưới để khám phá danh sách bài học (Lektion) và bắt đầu quá trình tích lũy từ vựng của bạn.
              </p>

              {topicsLoading && <p className="status-text">Đang tải danh sách chủ đề...</p>}
              {topicsError && <p className="status-text error">Lỗi: {topicsError}</p>}

              {!topicsLoading && effectiveTopics.length === 0 && !allLektionsLoading && (
                <p className="status-text">Chưa có chủ đề nào trong cấp độ này.</p>
              )}

              <div className="levels-grid">
                {effectiveTopics.map((t) => (
                  <div
                    key={t._id}
                    className="topic-card"
                    onClick={() => navigate(`/levels/${levelId}/topics/${t._id}`)}
                  >
                    <div className="topic-card-icon">{getTopicIcon(t.topic_name, t.icon)}</div>
                    <h3 className="topic-card-title">{t.topic_name}</h3>
                    <p className="topic-card-description">{t.description || `Các bài học thuộc chủ đề ${t.topic_name}`}</p>
                    <div className="topic-card-action">
                      Xem bài học ➔
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* BƯỚC 2: DANH SÁCH LEKTION THEO TOPIC */
            <>
              <h1 className="levels-title">
                {getTopicIcon(activeTopic.topic_name, activeTopic.icon)} {activeTopic.topic_name}
              </h1>
              <p className="levels-description">Trình độ {levelName} — Chọn bài học để bắt đầu ôn luyện từ vựng.</p>

              {lektionsLoading && <p className="status-text">Đang tải danh sách bài học...</p>}
              {lektionsError && <p className="status-text error">Lỗi: {lektionsError}</p>}

              {!lektionsLoading && displayLektions.length === 0 && (
                <p className="status-text">Không có bài học nào trong chủ đề này.</p>
              )}

              <div className="levels-grid">
                {displayLektions.map((lektion) => {
                  const displayTitle = lektion.lektion_name.includes('-')
                    ? lektion.lektion_name.split('-').pop()?.trim() || lektion.lektion_name
                    : lektion.lektion_name
                  const count = typeof lektion.vocabularyCount === 'number' ? lektion.vocabularyCount : 0
                  const progress = lektion.progress || { status: 'not_started', percentage: 0, learnedWordsCount: 0 }
                  const isCompleted = progress.status === 'completed' || progress.percentage === 100

                  return (
                    <div key={lektion._id} className="lektion-card">
                      <div className="lektion-card-header">
                        <h3 className="lektion-card-title">{displayTitle}</h3>
                        <span className="lektion-card-words">📖 {count} từ</span>
                      </div>

                      <div className="lektion-progress-section">
                        <div className="lektion-progress-info">
                          <span>Tiến độ</span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div className="lektion-progress-bar-bg">
                          <div
                            className={`lektion-progress-bar-fill ${isCompleted ? 'completed' : ''}`}
                            style={{ width: `${progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="lektion-card-footer">
                        <div className={`lektion-status ${isCompleted ? 'completed' : progress.status}`}>
                          {isCompleted ? '✓ Hoàn thành' : progress.status === 'in_progress' ? '⏳ Đang học' : '░ Chưa học'}
                        </div>

                        <Link to={`/lektion/${lektion._id}`} className={`lektion-start-btn ${isCompleted ? 'completed' : ''}`}>
                          {isCompleted ? 'Ôn lại ↺' : 'Bắt đầu học →'}
                        </Link>
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

export default LevelDetail