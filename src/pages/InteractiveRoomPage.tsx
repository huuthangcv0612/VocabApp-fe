import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { PremiumFeatureCard } from '../components/PremiumFeatureCard'
import { useSubscription } from '../hooks/useSubscription'
import '../styles/pages/interactive-room.css'

type ModeItem = {
  title: string
  icon: string
  description: string
  path: string
  isPremiumOnly?: boolean
}

const MODE_ITEMS: ModeItem[] = [
  {
    title: 'AI Grammar',
    icon: '✍️',
    description: 'Sửa lỗi ngữ pháp và chấm điểm câu tiếng Đức bằng AI.',
    path: '/interactive-room/grammar-check',
    isPremiumOnly: true,
  },
  {
    title: 'Lesson Nâng Cao',
    icon: '📚',
    description: 'Truy cập toàn bộ kho bài học chuyên sâu A1-B1.',
    path: '/levels',
    isPremiumOnly: true,
  },
  {
    title: 'Exercise Nâng Cao',
    icon: '✍️',
    description: 'Luyện tập trắc nghiệm và bài tập tương tác cao cấp.',
    path: '/lektion/1',
    isPremiumOnly: true,
  },
  {
    title: 'Progress Chuyên Sâu',
    icon: '📊',
    description: 'Báo cáo phân tích chi tiết kỹ năng và ghi nhớ từ vựng.',
    path: '/progress',
    isPremiumOnly: false,
  },
]

const InteractiveRoomPage = () => {
  const navigate = useNavigate()
  const { isPremium } = useSubscription()

  return (
    <div className="interactive-room">
      <Header />
      <main className="interactive-room-main">
        <div className="interactive-room-container">
          <div className="interactive-room-top">
            <button
              type="button"
              className="interactive-room-back"
              onClick={() => navigate('/levels')}
            >
              ← Danh sách bài học
            </button>
            <div className="interactive-room-badge">
              <span className="interactive-room-badge-icon">🤖</span>
              <span>Tính Năng & Premium</span>
            </div>
            <h1 className="interactive-room-title">
              Học Tiếng Đức Cùng <span>AI & Premium</span>
            </h1>
            <p className="interactive-room-subtitle">
              Mở khóa các tính năng AI Grammar, Bài học chuyên sâu và Luyện tập nâng cao.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
              marginTop: '32px',
            }}
          >
            {MODE_ITEMS.map((mode) => (
              <PremiumFeatureCard
                key={mode.title}
                title={mode.title}
                description={mode.description}
                isPremium={isPremium}
                isLocked={mode.isPremiumOnly ? !isPremium : false}
                onStart={() => navigate(mode.path)}
                buttonLabel="Bắt đầu"
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default InteractiveRoomPage
