import { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LevelTabs from '../components/LevelTabs'
import { useTopics, useLevels } from '../hooks/useApi'
import type { Topic } from '../services/api'
import '../styles/pages/levels.css'
import '../styles/components/topic-card.css'

const LEVEL_GROUPS = [
  { key: 'A1.1', label: 'Trình độ A1.1' },
  { key: 'A1.2', label: 'Trình độ A1.2' },
  { key: 'A2.1', label: 'Trình độ A2.1' },
  { key: 'A2.2', label: 'Trình độ A2.2' },
  { key: 'B1.1', label: 'Trình độ B1.1' },
]

const DEFAULT_TOPICS: Topic[] = [
  {
    _id: 'familie',
    topic_name: 'Familie (Gia đình)',
    icon: '👨‍👩‍👧',
    description: 'Từ vựng xưng hô, thành viên trong gia đình và các mối quan hệ thân thiết.',
  },
  {
    _id: 'gesundheit',
    topic_name: 'Gesundheit (Sức khỏe)',
    icon: '🏥',
    description: 'Từ vựng các bộ phận cơ thể, khám chữa bệnh và chăm sóc sức khỏe.',
  },
  {
    _id: 'arbeit',
    topic_name: 'Arbeit (Công việc)',
    icon: '💼',
    description: 'Từ vựng chủ đề văn phòng, nghề nghiệp và môi trường làm việc.',
  },
  {
    _id: 'alltag',
    topic_name: 'Alltag (Đời sống hàng ngày)',
    icon: '🏠',
    description: 'Các hoạt động thường nhật, thói quen sinh hoạt và vật dụng trong nhà.',
  },
  {
    _id: 'einkaufen',
    topic_name: 'Einkaufen (Mua sắm)',
    icon: '🛍️',
    description: 'Từ vựng siêu thị, hỏi giá, mua thực phẩm và vật dụng cá nhân.',
  },
  {
    _id: 'reisen',
    topic_name: 'Reisen & Verkehr (Du lịch & Giao thông)',
    icon: '✈️',
    description: 'Từ vựng về phương tiện giao thông, hỏi đường và vé máy bay/tàu hỏa.',
  },
  {
    _id: 'essen',
    topic_name: 'Essen & Trinken (Ẩm thực)',
    icon: '🍕',
    description: 'Từ vựng món ăn, đồ uống, đặt bàn tại nhà hàng và đồ ăn tiếng Đức.',
  },
  {
    _id: 'freizeit',
    topic_name: 'Freizeit (Giải trí)',
    icon: '⚽',
    description: 'Từ vựng về thể thao, sở thích cá nhân và các hoạt động cuối tuần.',
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
  const [selectedLevel, setSelectedLevel] = useState<string>(paramLevelId || 'A1.1')

  const { topics, loading: topicsLoading, error: topicsError } = useTopics(selectedLevel)
  const { levels } = useLevels()

  const currentLevelObj = levels.find(
    (l) => l._id === selectedLevel || l.level_name === selectedLevel
  )
  const displayLevelName = currentLevelObj ? currentLevelObj.level_name : selectedLevel

  const effectiveTopics = useMemo(() => {
    if (Array.isArray(topics) && topics.length > 0) {
      return topics
    }
    return DEFAULT_TOPICS
  }, [topics])

  return (
    <div className="levels">
      <Header />

      <section className="levels-section">
        <div className="levels-container">
          <div className="topic-header-bar">
            <Link to="/levels" className="back-link">
              ← Chọn Trình Độ khác
            </Link>
          </div>

          <h1 className="levels-title">Các Chủ Đề Học Tập</h1>
          <p className="levels-description">
            Chọn chủ đề bạn muốn luyện tập để xem danh sách bài học (Lektion) tương ứng thuộc trình độ <strong>{displayLevelName}</strong>.
          </p>

          <div className="levels-tabs-wrapper">
            <LevelTabs
              levels={LEVEL_GROUPS.map((group) => group.key)}
              labels={LEVEL_GROUPS.map((group) => group.label)}
              activeLevel={selectedLevel}
              onSelectLevel={(levelKey) => {
                setSelectedLevel(levelKey)
                navigate(`/topics?levelId=${levelKey}`)
              }}
            />
          </div>

          {topicsLoading && <p className="status-text">Đang tải danh sách chủ đề...</p>}
          {topicsError && <p className="status-text error">Lỗi: {topicsError}</p>}

          <div className="levels-grid">
            {effectiveTopics.map((topic) => {
              const topicName = topic?.topic_name || (topic as any)?.name || (topic as any)?.title || 'Chủ đề'
              const icon = getTopicIcon(topicName, topic?.icon)
              return (
                <div
                  key={topic._id || Math.random().toString()}
                  className="topic-card"
                  onClick={() => navigate(`/levels/${selectedLevel}/topics/${topic._id}`)}
                >
                  <div className="topic-card-icon">{icon}</div>
                  <h3 className="topic-card-title">{topicName}</h3>
                  <p className="topic-card-description">
                    {topic?.description || `Các bài học từ vựng tiếng Đức chủ đề ${topicName}`}
                  </p>
                  <div className="topic-card-action">
                    Bắt đầu xem Lektion ➔
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default TopicsPage
