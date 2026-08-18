import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTopics, useTopicLektions, useLektions, useLevels } from '../hooks/useApi'
import type { Topic, LektionWithProgress } from '../services/api'
import CloudIcon from '../assets/Cloud.svg'
import GirlIcon from '../assets/Girl 1.svg'
import '../styles/pages/levels.css'

const LevelDetail = () => {
  const { levelId, topicId } = useParams<{ levelId: string; topicId?: string }>()
  const navigate = useNavigate()
  const { levels } = useLevels()
  const { topics } = useTopics(levelId)
  const { lektions: allLektions } = useLektions(levelId)

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
    if (!topicId) return effectiveTopics[0] || null
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
    if (!activeTopic) return allLektions
    const filtered = allLektions.filter((l) => {
      if (typeof l.topic === 'string') return l.topic === activeTopic._id || l.topic === activeTopic.topic_name
      if (l.topic && typeof l.topic === 'object') return l.topic._id === activeTopic._id || l.topic.topic_name === activeTopic.topic_name
      return false
    })
    return filtered.length > 0 ? filtered : allLektions
  }, [topicLektions, allLektions, activeTopic])

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
              CHOOSE<br />LEKTION
            </h1>
          </div>

          <div className="lektion-hero-girl-wrapper">
            <img src={GirlIcon} alt="Girl on surfboard" className="lektion-hero-girl-img" />
          </div>
        </div>

        {/* Bottom Scalloped Wave */}
        <div className="lektion-hero-wave"></div>
      </section>

      {/* Section 2: WHAT LEKTION YOU LIKE ? Selection Grid */}
      <section className="lektion-selection-section">
        <div className="lektion-container">
          <h2 className="lektion-section-title">WHAT LEKTION YOU LIKE ?</h2>

          {lektionsLoading && <p className="status-text white-text">Đang tải danh sách bài học...</p>}
          {lektionsError && <p className="status-text error">Lỗi: {lektionsError}</p>}

          {!lektionsLoading && displayLektions.length === 0 && (
            <p className="status-text white-text">
              Chưa có bài học nào trong chủ đề này ({activeTopic?.topic_name || levelName}).
            </p>
          )}

          {/* Lektion Cards Grid */}
          <div className="lektion-cards-grid">
            {displayLektions.map((lektion) => {
              const displayTitle = lektion.lektion_name.includes('-')
                ? lektion.lektion_name.split('-').pop()?.trim() || lektion.lektion_name
                : lektion.lektion_name
              const count = typeof lektion.vocabularyCount === 'number' ? lektion.vocabularyCount : 0
              const progress = lektion.progress || { status: 'not_started', percentage: 0, learnedWordsCount: 0 }
              const isCompleted = progress.status === 'completed' || progress.percentage === 100

              return (
                <div
                  key={lektion._id}
                  className="lektion-card-item"
                  onClick={() => navigate(`/lektion/${lektion._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="lektion-card-image-wrapper">
                    <span className="lektion-card-icon-lg">📚</span>
                  </div>

                  <div className="lektion-card-content">
                    <h3 className="lektion-card-name">{displayTitle}</h3>
                    <p className="lektion-card-desc">
                      📖 {count} từ vựng • {isCompleted ? '✓ Hoàn thành' : progress.percentage > 0 ? `⏳ Đang học (${progress.percentage}%)` : '░ Chưa học'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Scalloped Wave before Footer */}
        <div className="lektion-bottom-wave"></div>
      </section>

      <Footer />
    </div>
  )
}

export default LevelDetail