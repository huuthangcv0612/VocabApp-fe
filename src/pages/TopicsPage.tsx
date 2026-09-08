import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useTopics, useLevels } from '../hooks/useApi'
import type { Topic } from '../services/api'
import CloudIcon from '../assets/Cloud.svg'
import KidIcon from '../assets/Boy 3 1.svg'
import '../styles/pages/levels.css'

const DEFAULT_TOPICS: Topic[] = [
  {
    _id: 'familie',
    topic_name: 'Familie',
    icon: '👨‍👩‍👧',
    description: 'Từ vựng xưng hô, thành viên trong gia đình và các mối quan hệ thân thiết.',
  },
  {
    _id: 'conversation',
    topic_name: 'Conversation',
    icon: '💬',
    description: 'Các mẫu câu giao tiếp thông dụng hàng ngày trong tiếng Đức.',
  },
  {
    _id: 'zahlen',
    topic_name: 'Zahlen',
    icon: '🔢',
    description: 'Học đếm số, cách nói ngày tháng năm và giá cả tiếng Đức.',
  },
  {
    _id: 'gesundheit',
    topic_name: 'Gesundheit',
    icon: '🏥',
    description: 'Từ vựng các bộ phận cơ thể, khám chữa bệnh và chăm sóc sức khỏe.',
  },
  {
    _id: 'einkaufen',
    topic_name: 'Einkaufen',
    icon: '🛍️',
    description: 'Từ vựng siêu thị, hỏi giá, mua thực phẩm và vật dụng cá nhân.',
  },
  {
    _id: 'essen',
    topic_name: 'Essen & Trinken',
    icon: '🍕',
    description: 'Từ vựng món ăn, đồ uống, đặt bàn tại nhà hàng tiếng Đức.',
  },
]

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
  Zahlen: '🔢',
  Conversation: '💬',
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

const TopicsPage = () => {
  const { levelId: paramLevelId } = useParams<{ levelId?: string }>()
  const navigate = useNavigate()
  const selectedLevel = paramLevelId || 'A1.1'

  const { topics, loading: topicsLoading, error: topicsError } = useTopics(selectedLevel)
  const { levels } = useLevels()

  const currentLevelObj = levels.find(
    (l) => l._id === selectedLevel || l.level_name === selectedLevel
  )
  const displayLevelName = currentLevelObj ? currentLevelObj.level_name : selectedLevel

  const effectiveTopics = useMemo<Topic[]>(() => {
    if (Array.isArray(topics) && topics.length > 0) {
      return topics
    }
    return DEFAULT_TOPICS
  }, [topics])

  return (
    <div className="topics-page">
      <Header />

      {/* Section 1: Hero Banner */}
      <section className="topics-hero-section">
        {/* Floating Clouds */}
        <img src={CloudIcon} alt="" className="hero-cloud cloud-1" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-2" />
        <img src={CloudIcon} alt="" className="hero-cloud cloud-3" />

        <div className="topics-hero-container">
          <div className="topics-hero-title-wrapper">
            <h1 className="topics-hero-title">
              CHOOSE<br />TOPIC
            </h1>
          </div>

          <div className="topics-hero-kid-wrapper">
            <img src={KidIcon} alt="Kid with lollipop" className="topics-hero-kid-img" />
          </div>
        </div>

        {/* Bottom Scalloped Wave */}
        <div className="topics-hero-wave"></div>
      </section>

      {/* Section 2: WHAT TOPIC YOU LIKE ? Selection Grid */}
      <section className="topics-selection-section">
        <div className="topics-container">
          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => navigate('/levels')}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              ← Back to Levels ({displayLevelName})
            </button>
          </div>
          <h2 className="topics-section-title">WHAT TOPIC YOU LIKE ?</h2>

          {topicsLoading && <p className="status-text white-text">Đang tải danh sách chủ đề...</p>}
          {topicsError && <p className="status-text error">Lỗi: {topicsError}</p>}

          {!topicsLoading && effectiveTopics.length === 0 && (
            <p className="status-text white-text">Chưa có chủ đề nào trong cấp độ {displayLevelName}.</p>
          )}

          {/* Topic Cards Grid */}
          <div className="topics-cards-grid">
            {effectiveTopics.map((topic: Topic) => {
              const topicName = topic?.topic_name || topic?.name || 'Chủ đề'
              const icon = getTopicIcon(topicName, topic?.icon)

              return (
                <div
                  key={topic._id || Math.random().toString()}
                  className="topic-card-item"
                  onClick={() => navigate(`/levels/${selectedLevel}/topics/${topic._id || topicName}`)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="topic-card-image-wrapper">
                    <span className="topic-card-icon-lg">{icon}</span>
                  </div>

                  <div className="topic-card-content">
                    <h3 className="topic-card-name">{topicName}</h3>
                    <p className="topic-card-desc">
                      {topic?.description || `Các bài học từ vựng tiếng Đức thuộc chủ đề ${topicName}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Scalloped Wave before Footer */}
        <div className="topics-bottom-wave"></div>
      </section>

      <Footer />
    </div>
  )
}

export default TopicsPage
